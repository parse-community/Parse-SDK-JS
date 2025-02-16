import CoreManager from './CoreManager';
import decode from './decode';
import ParseError from './ParseError';

export type HookDeclaration =
  | { functionName: string; url: string }
  | { className: string; triggerName: string; url: string };
export type HookDeleteArg = { functionName: string } | { className: string; triggerName: string };

export function getFunctions() {
  return CoreManager.getHooksController().get('functions');
}

export function getTriggers() {
  return CoreManager.getHooksController().get('triggers');
}

export function getFunction(name: string) {
  return CoreManager.getHooksController().get('functions', name);
}

export function getTrigger(className: string, triggerName: string) {
  return CoreManager.getHooksController().get('triggers', className, triggerName);
}

export function createFunction(functionName: string, url: string) {
  return create({ functionName: functionName, url: url });
}

export function createTrigger(className: string, triggerName: string, url: string) {
  return create({ className: className, triggerName: triggerName, url: url });
}

export function create(hook: HookDeclaration) {
  return CoreManager.getHooksController().create(hook);
}

export function updateFunction(functionName: string, url: string) {
  return update({ functionName: functionName, url: url });
}

export function updateTrigger(className: string, triggerName: string, url: string) {
  return update({ className: className, triggerName: triggerName, url: url });
}

export function update(hook: HookDeclaration) {
  return CoreManager.getHooksController().update(hook);
}

export function removeFunction(functionName: string) {
  return remove({ functionName: functionName });
}

export function removeTrigger(className: string, triggerName: string) {
  return remove({ className: className, triggerName: triggerName });
}

export function remove(hook: HookDeleteArg) {
  return CoreManager.getHooksController().remove(hook);
}

const DefaultController = {
  get(type: string, functionName?: string, triggerName?: string) {
    let url = 'hooks/' + type;
    if (functionName) {
      url += '/' + functionName;
      if (triggerName) {
        url += '/' + triggerName;
      }
    }
    return this.sendRequest('GET', url);
  },

  create(hook) {
    let url;
    if (hook.functionName && hook.url) {
      url = 'hooks/functions';
    } else if (hook.className && hook.triggerName && hook.url) {
      url = 'hooks/triggers';
    } else {
      return Promise.reject({ error: 'invalid hook declaration', code: 143 });
    }
    return this.sendRequest('POST', url, hook);
  },

  remove(hook) {
    let url;
    if (hook.functionName) {
      url = 'hooks/functions/' + hook.functionName;
      delete hook.functionName;
    } else if (hook.className && hook.triggerName) {
      url = 'hooks/triggers/' + hook.className + '/' + hook.triggerName;
      delete hook.className;
      delete hook.triggerName;
    } else {
      return Promise.reject({ error: 'invalid hook declaration', code: 143 });
    }
    return this.sendRequest('PUT', url, { __op: 'Delete' });
  },

  update(hook) {
    let url;
    if (hook.functionName && hook.url) {
      url = 'hooks/functions/' + hook.functionName;
      delete hook.functionName;
    } else if (hook.className && hook.triggerName && hook.url) {
      url = 'hooks/triggers/' + hook.className + '/' + hook.triggerName;
      delete hook.className;
      delete hook.triggerName;
    } else {
      return Promise.reject({ error: 'invalid hook declaration', code: 143 });
    }
    return this.sendRequest('PUT', url, hook);
  },

  sendRequest(method: string, url: string, body?: any) {
    return CoreManager.getRESTController()
      .request(method, url, body, { useMasterKey: true })
      .then(res => {
        const decoded = decode(res);
        if (decoded) {
          return Promise.resolve(decoded);
        }
        return Promise.reject(
          new ParseError(ParseError.INVALID_JSON, 'The server returned an invalid response.')
        );
      });
  },
};

CoreManager.setHooksController(DefaultController);
