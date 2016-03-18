'use strict';

const assert = require('assert');
const clear = require('./clear');
const mocha = require('mocha');
const Parse = require('../../node');

describe('Parse Object Subclasses', () => {
  before((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => {
      done();
    });
  });

  it('uses subclasses when doing query find', (done) => {
    let Subclass = Parse.Object.extend('Subclass', {
      initialize(attributes, options, number) {
        this.number = number || -1;
      }
    });

    let object = new Subclass({}, {}, 57);
    assert.equal(object.number, 57);
    object.save().then(() => {
      let query = new Parse.Query(Subclass);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      assert(results[0] instanceof Subclass);
      assert.equal(results[0].number, -1);
      done();
    });
  });

  it('uses subclasses when doing query get', (done) => {
    let Subclass = Parse.Object.extend('Subclass', {
      initialize(attributes, options, number) {
        this.number = number || -1;
      }
    });

    let object = new Subclass({}, {}, 57);
    assert.equal(object.number, 57);
    object.save().then(() => {
      let query = new Parse.Query(Subclass);
      return query.get(object.id);
    }).then((result) => {
      assert(result instanceof Subclass);
      assert.equal(result.number, -1);
      done();
    });
  });

  it('uses subclasses with array results', (done) => {
    let Container = Parse.Object.extend('Container');
    let Item = Parse.Object.extend('Item');
    let ItemChild = Parse.Object.extend('Item');
    let ItemGrandchild = ItemChild.extend();

    let item = new Item();
    item.save({ foo: 'bar' }).then(() => {
      let container = new Container();
      return container.save({ items: [item] });
    }).then((container) => {
      let query = new Parse.Query(Container);
      return query.get(container.id);
    }).then((container) => {
      assert(container instanceof Container);
      assert.equal(container.get('items').length, 1);
      let item = container.get('items')[0];
      assert(item instanceof Item);
      assert(item instanceof ItemChild);
      assert(item instanceof ItemGrandchild);
      done();
    });
  });

  it('can subclass multiple levels explicitly', (done) => {
    let Parent = Parse.Object.extend('MyClass', {
      initialize() {
        Parent.__super__.initialize.apply(this, arguments);
        this.parent = true;
      }
    });

    let Child = Parent.extend({
      initialize() {
        Child.__super__.initialize.apply(this, arguments);
        this.child = true;
      }
    });

    let Grandchild = Child.extend({
      initialize() {
        Grandchild.__super__.initialize.apply(this, arguments);
        this.grandchild = true;
      }
    });

    let object = new Parent();

    object.save().then(() => {
      let query = new Parse.Query(Grandchild);
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
    let Parent = Parse.Object.extend('MyClass', {
      initialize() {
        Parent.__super__.initialize.apply(this, arguments);
        this.parent = true;
      }
    });

    let Child = Parse.Object.extend('MyClass', {
      initialize() {
        Child.__super__.initialize.apply(this, arguments);
        this.child = true;
      }
    });

    let Grandchild = Parse.Object.extend('MyClass', {
      initialize() {
        Grandchild.__super__.initialize.apply(this, arguments);
        this.grandchild = true;
      }
    });

    let object = new Parent();

    object.save().then(() => {
      let query = new Parse.Query(Grandchild);
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
    let Parent = Parse.Object.extend('MyClass');
    let Child = Parent.extend();
    let Grandchild = Child.extend('NewClass');

    let object = new Parent();

    object.save().then(() => {
      let query = new Parse.Query(Child);
      return query.get(object.id);
    }).then((result) => {
      assert(result instanceof Parent);
      assert(result instanceof Child);
      
      let query = new Parse.Query(Grandchild);
      return query.get(object.id);
    }).then(null, () => {
      // No object found
      done();
    });
  });

  it('propagates instance properties', () => {
    let Squirtle = Parse.Object.extend('Squirtle', {
      water: true
    });
    var Wartortle = Squirtle.extend('Wartortle');
    let wartortle = new Wartortle();
    assert(wartortle.water);
  });
});
