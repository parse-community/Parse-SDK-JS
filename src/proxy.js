import deepcopy from 'deepcopy';
const nestedHandler = {
  updateParent(key, value) {
    const levels = this._path.split('.');
    levels.push(key);
    const topLevel = levels[0];
    levels.shift();
    const scope = deepcopy(this._parent[topLevel]);
    let target = scope;
    const max_level = levels.length - 1;
    levels.some((level, i) => {
      if (typeof level === 'undefined') {
        return true;
      }
      if (i === max_level) {
        if (value == null) {
          delete target[level];
        } else {
          target[level] = value;
        }
      } else {
        const obj = target[level] || (this._array ? [] : {});
        target = obj;
      }
    });
    this._parent[topLevel] = scope;
  },
  get(target, key, receiver) {
    const reflector = Reflect.get(target, key, receiver);
    const prop = target[key];
    if (
      Array.isArray(prop) ||
      (Object.prototype.toString.call(prop) === '[object Object]' &&
        prop?.constructor?.name === 'Object')
    ) {
      const thisHandler = deepcopy(nestedHandler);
      thisHandler._path = `${this._path}.${key}`;
      thisHandler._parent = this._parent;
      const isArray = Array.isArray(prop);
      thisHandler._array = isArray;
      return new Proxy(deepcopy(prop), thisHandler);
    }
    return reflector;
  },
  set(target, key, value) {
    target[key] = value;
    this.updateParent(key, value);
    return true;
  },
  deleteProperty(target, key) {
    const response = delete target[key];
    this.updateParent(key);
    return response;
  },
};
const proxyHandler = {
  get(target, key, receiver) {
    const getValue = target.get(key);
    if (
      Object.prototype.toString.call(getValue) === '[object Object]' &&
      getValue?.constructor?.name === 'Object'
    ) {
      const thisHandler = deepcopy(nestedHandler);
      thisHandler._path = key;
      thisHandler._parent = receiver;
      return new Proxy(deepcopy(getValue), thisHandler);
    }
    return getValue;
  },

  set(target, key, value) {
    target.set(key, value);
    return true;
  },

  deleteProperty(target, key) {
    return target.unset(key);
  },
  ownKeys(target) {
    // called once to get a list of properties
    return Object.keys(target.attributes);
  },

  getOwnPropertyDescriptor() {
    return {
      enumerable: true,
      configurable: true,
    };
  },
};
export default proxyHandler;
