'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

describe('Parse Object Subclasses', () => {
  beforeEach((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(done);
  });

  it('uses subclasses when doing query find', (done) => {
    const Subclass = Parse.Object.extend('Subclass', {
      initialize(attributes, options, number) {
        this.number = number || -1;
      }
    });

    const object = new Subclass({}, {}, 57);
    assert.equal(object.number, 57);
    object.save().then(() => {
      const query = new Parse.Query(Subclass);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert(results[0] instanceof Subclass);
      assert.equal(results[0].number, -1);
      done();
    });
  });

  it('uses subclasses when doing query get', (done) => {
    const Subclass = Parse.Object.extend('Subclass', {
      initialize(attributes, options, number) {
        this.number = number || -1;
      }
    });

    const object = new Subclass({}, {}, 57);
    assert.equal(object.number, 57);
    object.save().then(() => {
      const query = new Parse.Query(Subclass);
      return query.get(object.id);
    }).then((result) => {
      assert(result instanceof Subclass);
      assert.equal(result.number, -1);
      done();
    });
  });

  it('uses subclasses with array results', (done) => {
    const Container = Parse.Object.extend('Container');
    const Item = Parse.Object.extend('Item');
    const ItemChild = Parse.Object.extend('Item');
    const ItemGrandchild = ItemChild.extend();

    const item = new Item();
    item.save({ foo: 'bar' }).then(() => {
      const container = new Container();
      return container.save({ items: [item] });
    }).then((container) => {
      const query = new Parse.Query(Container);
      return query.get(container.id);
    }).then((container) => {
      assert(container instanceof Container);
      assert.equal(container.get('items').length, 1);
      const item = container.get('items')[0];
      assert(item instanceof Item);
      assert(item instanceof ItemChild);
      assert(item instanceof ItemGrandchild);
      done();
    });
  });

  it('can subclass multiple levels explicitly', (done) => {
    const Parent = Parse.Object.extend('MyClass', {
      initialize() {
        Parent.__super__.initialize.apply(this, arguments);
        this.parent = true;
      }
    });

    const Child = Parent.extend({
      initialize() {
        Child.__super__.initialize.apply(this, arguments);
        this.child = true;
      }
    });

    const Grandchild = Child.extend({
      initialize() {
        Grandchild.__super__.initialize.apply(this, arguments);
        this.grandchild = true;
      }
    });

    const object = new Parent();

    object.save().then(() => {
      const query = new Parse.Query(Grandchild);
      return query.get(object.id);
    }).then((result) => {
      assert(result instanceof Parent);
      assert(result instanceof Child);
      assert(result instanceof Grandchild);
      assert(result.parent);
      assert(result.child);
      assert(result.grandchild);
      done();
    });
  });

  it('can subclass multiple levels implicitly', (done) => {
    const Parent = Parse.Object.extend('MyClass', {
      initialize() {
        Parent.__super__.initialize.apply(this, arguments);
        this.parent = true;
      }
    });

    const Child = Parse.Object.extend('MyClass', {
      initialize() {
        Child.__super__.initialize.apply(this, arguments);
        this.child = true;
      }
    });

    const Grandchild = Parse.Object.extend('MyClass', {
      initialize() {
        Grandchild.__super__.initialize.apply(this, arguments);
        this.grandchild = true;
      }
    });

    const object = new Parent();

    object.save().then(() => {
      const query = new Parse.Query(Grandchild);
      return query.get(object.id);
    }).then((result) => {
      assert(result instanceof Parent);
      assert(result instanceof Child);
      assert(result instanceof Grandchild);
      assert(result.parent);
      assert(result.child);
      assert(result.grandchild);
      done();
    });
  });

  it('can subclass multiple levels explicitly with different names', (done) => {
    const Parent = Parse.Object.extend('MyClass');
    const Child = Parent.extend();
    const Grandchild = Child.extend('NewClass');

    const object = new Parent();

    object.save().then(() => {
      const query = new Parse.Query(Child);
      return query.get(object.id);
    }).then((result) => {
      assert(result instanceof Parent);
      assert(result instanceof Child);

      const query = new Parse.Query(Grandchild);
      return query.get(object.id);
    }).then(null, () => {
      // No object found
      done();
    });
  });

  it('propagates instance properties', () => {
    const Squirtle = Parse.Object.extend('Squirtle', {
      water: true
    });
    const Wartortle = Squirtle.extend('Wartortle');
    const wartortle = new Wartortle();
    assert(wartortle.water);
  });
});
