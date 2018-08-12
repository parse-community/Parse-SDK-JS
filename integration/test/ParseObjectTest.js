'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');
const path = require('path');

const TestObject = Parse.Object.extend('TestObject');
const Item = Parse.Object.extend('Item');
const Container = Parse.Object.extend('Container');

const DEFAULT_PIN = Parse.LocalDatastore.DEFAULT_PIN;
const PIN_PREFIX = Parse.LocalDatastore.PIN_PREFIX;

global.localStorage = require('./mockLocalStorage');

describe('Parse Object', () => {
  beforeEach((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    Parse.LocalDatastore._clear();
    clear().then(() => {
      done();
    });
  });

  it('can create objects', (done) => {
    let object = new TestObject({ test: 'test' });
    object.save().then((o) => {
      assert(o);
      assert(o.id);
      assert.equal(o.get('test'), 'test');
      done();
    });
  });

  it('can update objects', (done) => {
    let object = new TestObject({ test: 'test' });
    object.save().then((o) => {
      let o2 = new TestObject({ objectId: o.id });
      o2.set('test', 'changed');
      return o2.save();
    }).then((o) => {
      assert.equal(o.get('test'), 'changed');
      done();
    });
  });

  it('can save a cycle', (done) => {
    let a = new TestObject();
    let b = new TestObject();
    a.set('b', b);
    a.save().then(() => {
      b.set('a', a);
      return b.save();
    }).then(() => {
      assert(a.id);
      assert(b.id);
      assert.equal(a.get('b').id, b.id);
      assert.equal(b.get('a').id, a.id);
      done();
    });
  });

  it('can get objects', (done) => {
    let object = new TestObject({ test: 'test' });
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('test'), 'test');
      assert.equal(o.id, object.id);
      done();
    });
  });

  it('can delete an object', (done) => {
    let object = new TestObject({ test: 'test' });
    object.save().then(() => {
      return object.destroy();
    }).then(() => {
      return object.fetch();
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('can find objects', (done) => {
    let object = new TestObject({ foo: 'bar' });
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('foo', 'bar');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      done();
    });
  });

  it('can establish relational fields', (done) => {
    let item = new Item();
    item.set('property', 'x');
    let container = new Container();
    container.set('item', item);

    Parse.Object.saveAll([item, container]).then(() => {
      let query = new Parse.Query(Container);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      let containerAgain = results[0];
      let itemAgain = containerAgain.get('item');
      return itemAgain.fetch();
    }).then((itemAgain) => {
      assert.equal(itemAgain.get('property'), 'x');
      done();
    });
  });

  it('adds no fields on save (beyond createdAt and updatedAt)', (done) => {
    let object = new TestObject();
    object.save().then(() => {
      let attributes = object.attributes;
      assert(attributes.createdAt);
      assert(attributes.updatedAt);
      let keys = Object.keys(attributes);
      assert.equal(keys.length, 2);
      done();
    });
  });

  it('can perform a recursive save', (done) => {
    let item = new Item();
    item.set('property', 'x');
    let container = new Container();
    container.set('item', item);

    container.save().then(() => {
      let query = new Parse.Query(Container);
      return query.get(container.id);
    }).then((result) => {
      assert(result);
      let containerAgain = result;
      let itemAgain = containerAgain.get('item');
      return itemAgain.fetch();
    }).then((itemAgain) => {
      assert.equal(itemAgain.get('property'), 'x');
      done();
    });
  });

  it('can fetch server data', (done) => {
    let item = new Item({ foo: 'bar' });
    item.save().then(() => {
      let itemAgain = new Item();
      itemAgain.id = item.id;
      return itemAgain.fetch();
    }).then((itemAgain) => {
      assert.equal(itemAgain.get('foo'), 'bar');
      return itemAgain.save({ foo: 'baz' });
    }).then(() => {
      return item.fetch();
    }).then((itemAgain) => {
      assert.equal(item.get('foo'), itemAgain.get('foo'));
      done();
    }).catch(done.fail);
  });

  it('does not remove old fields on fetch', (done) => {
    let object = new Parse.Object('SimpleObject');
    object.set('foo', 'bar');
    object.set('test', 'foo');
    let object1 = null;
    let object2 = null;
    object.save().then(() => {
      let query = new Parse.Query('SimpleObject');
      return query.get(object.id);
    }).then((o) => {
      object1 = o;
      let query = new Parse.Query('SimpleObject');
      return query.get(object.id);
    }).then((o) => {
      object2 = o;
      assert.equal(object1.get('test'), 'foo');
      assert.equal(object2.get('test'), 'foo');
      object2.unset('test');
      return object2.save();
    }).then((o) => {
      object2 = o;
      return object1.fetch();
    }).then((o) => {
      object1 = o;
      assert.equal(object2.get('test'), undefined);
      assert.equal(object2.get('foo'), 'bar');
      assert.equal(object1.get('test'), undefined);
      assert.equal(object1.get('foo'), 'bar');
      done();
    });
  });

  it('does not change createdAt', (done) => {
    let object = new TestObject({ foo: 'bar' });
    object.save().then(() => {
      let objectAgain = new TestObject();
      objectAgain.id = object.id;
      return objectAgain.fetch();
    }).then((o) => {
      assert.equal(o.createdAt.getTime(), object.createdAt.getTime());
      done();
    });
  });

  it('exposes createdAt and updatedAt as top level properties', (done) => {
    let object = new TestObject({ foo: 'bar' });
    object.save().then(() => {
      assert(object.updatedAt);
      assert(object.createdAt);
      done();
    });
  });

  it('produces a reasonable createdAt time', (done) => {
    let start = new Date();
    let object = new TestObject({ foo: 'bar' });
    object.save().then(() => {
      let end = new Date();
      let startDiff = Math.abs(start.getTime() - object.createdAt.getTime());
      let endDiff = Math.abs(end.getTime() - object.createdAt.getTime());
      done();
    });
  });

  it('can set keys to null', (done) => {
    let obj = new TestObject();
    obj.set('foo', null);
    obj.save().then(() => {
      assert.equal(obj.get('foo'), null);
      done();
    });
  });

  it('can set boolean fields', (done) => {
    let obj = new TestObject();
    obj.set('yes', true);
    obj.set('no', false);
    obj.save().then(() => {
      assert.equal(obj.get('yes'), true);
      assert.equal(obj.get('no'), false);
      done();
    });
  });

  it('cannot set an invalid date', (done) => {
    let obj = new TestObject();
    obj.set('when', new Date(Date.parse(null)));
    obj.save().catch((e) => {
      done();
    });
  });

  it('cannot create invalid class names', (done) => {
    let item = new Parse.Object('Foo^Bar');
    item.save().catch((e) => {
      done();
    });
  });

  it('cannot create invalid key names', (done) => {
    let item = new Parse.Object('Item');
    assert(!item.set({ 'foo^bar': 'baz' }));
    item.save({ 'foo^bar': 'baz' }).catch((e) => {
      assert.equal(e.code, Parse.Error.INVALID_KEY_NAME);
      done();
    });
  });

  it('cannot use invalid key names in multiple sets', () => {
    let item = new Parse.Object('Item');
    assert(!item.set({
      'foobar': 'baz',
      'foo^bar': 'baz'
    }));
    assert(!item.get('foobar'));
  });

  it('can unset fields', (done) => {
    let simple = new Parse.Object('SimpleObject');
    simple.save({ foo: 'bar' }).then(() => {
      simple.unset('foo');
      assert(!simple.has('foo'));
      assert(simple.dirty('foo'));
      assert(simple.dirty());
      return simple.save();
    }).then(() => {
      assert(!simple.has('foo'));
      assert(!simple.dirty('foo'));
      assert(!simple.dirty());

      let query = new Parse.Query('SimpleObject');
      return query.get(simple.id);
    }).then((s) => {
      assert(!s.has('foo'));
      done();
    });
  });

  it('can delete fields before the first save', (done) => {
    let simple = new Parse.Object('SimpleObject');
    simple.set('foo', 'bar');
    simple.unset('foo');

    assert(!simple.has('foo'));
    assert(simple.dirty('foo'));
    assert(simple.dirty());
    simple.save().then(() => {
      assert(!simple.has('foo'));
      assert(!simple.dirty('foo'));
      assert(!simple.dirty());

      let query = new Parse.Query('SimpleObject');
      return query.get(simple.id);
    }).then((s) => {
      assert(!s.has('foo'));
      done();
    });
  });

  it('can delete pointers', (done) => {
    let simple = new Parse.Object('SimpleObject');
    let child = new Parse.Object('Child');
    simple.save({ child: child }).then(() => {
      simple.unset('child');
      assert(!simple.has('child'));
      assert(simple.dirty('child'));
      assert(simple.dirty());
      return simple.save();
    }).then(() => {
      assert(!simple.has('child'));
      assert(!simple.dirty('child'));
      assert(!simple.dirty());

      let query = new Parse.Query('SimpleObject');
      return query.get(simple.id);
    }).then((s) => {
      assert(!s.has('foo'));
      done();
    });
  });

  it('clears deleted keys', (done) => {
    let simple = new Parse.Object('SimpleObject');
    simple.set('foo', 'bar');
    simple.unset('foo');
    simple.save().then(() => {
      simple.set('foo', 'baz');
      return simple.save();
    }).then(() => {
      let query = new Parse.Query('SimpleObject');
      return query.get(simple.id);
    }).then((s) => {
      assert.equal(s.get('foo'), 'baz');
      done();
    });
  });

  it('can set keys after deleting them', (done) => {
    let simple = new Parse.Object('SimpleObject');
    simple.set('foo', 'bar')
    simple.save().then(() => {
      simple.unset('foo');
      simple.set('foo', 'baz');
      return simple.save();
    }).then(() => {
      let query = new Parse.Query('SimpleObject');
      return query.get(simple.id);
    }).then((s) => {
      assert.equal(s.get('foo'), 'baz');
      done();
    });
  });

  it('can increment fields', (done) => {
    let simple = new Parse.Object('SimpleObject');
    simple.save({ count: 5 }).then(() => {
      simple.increment('count');
      assert.equal(simple.get('count'), 6);
      assert(simple.dirty('count'));
      assert(simple.dirty());
      return simple.save();
    }).then(() => {
      assert.equal(simple.get('count'), 6);
      assert(!simple.dirty('count'));
      assert(!simple.dirty());

      let query = new Parse.Query('SimpleObject');
      return query.get(simple.id);
    }).then((s) => {
      assert.equal(s.get('count'), 6);
      done();
    });
  });

  it('can set the object id', () => {
    let object = new TestObject();
    object.set('objectId', 'foo');
    assert.equal(object.id, 'foo');
    object.set('id', 'bar');
    assert.equal(object.id, 'bar');
  });

  it('can mark dirty attributes', (done) => {
    let object = new TestObject();
    object.set('cat', 'goog');
    object.set('dog', 'bad');
    object.save().then(() => {
      assert(!object.dirty());
      assert(!object.dirty('cat'));
      assert(!object.dirty('dog'));

      object.set('dog', 'okay');

      assert(object.dirty());
      assert(!object.dirty('cat'));
      assert(object.dirty('dog'));

      done();
    });
  });

  it('can collect dirty keys', (done) => {
    let object = new TestObject();
    object.set('dog', 'good');
    object.set('cat', 'bad');
    assert(object.dirty());
    let dirtyKeys = object.dirtyKeys();
    assert.equal(dirtyKeys.length, 2);
    assert(dirtyKeys.indexOf('dog') > -1);
    assert(dirtyKeys.indexOf('cat') > -1);

    object.save().then(() => {
      assert(!object.dirty());
      dirtyKeys = object.dirtyKeys();
      assert.equal(dirtyKeys.length, 0);
      assert(dirtyKeys.indexOf('dog') < 0);
      assert(dirtyKeys.indexOf('cat') < 0);

      object.unset('cat');
      assert(object.dirty());
      dirtyKeys = object.dirtyKeys();
      assert.equal(dirtyKeys.length, 1);
      assert(dirtyKeys.indexOf('dog') < 0);
      assert(dirtyKeys.indexOf('cat') > -1);

      return object.save();
    }).then(() => {
      assert(!object.dirty());
      assert.equal(object.get('dog'), 'good');
      assert.equal(object.get('cat'), undefined);
      dirtyKeys = object.dirtyKeys();
      assert.equal(dirtyKeys.length, 0);
      assert(dirtyKeys.indexOf('dog') < 0);
      assert(dirtyKeys.indexOf('cat') < 0);
      done();
    });
  });

  it('can set ops directly', (done) => {
    let object = new Parse.Object('TestObject');
    object.set({ cat: 'good', dog: 'bad' });
    object.save().then(() => {
      assert.equal(object.get('cat'), 'good');

      object.set({ x: { __op: 'Increment', amount: 5 }});
      assert.equal(object.get('x'), 5);
      assert(object.dirty());
      assert(object.dirty('x'));
      assert(!object.dirty('cat'));
      assert(object.op('x') instanceof Parse.Op.Increment);
      assert.equal(object.op('x')._amount, 5);

      object.set({ x: { __op: 'Increment', amount: 2 }});
      assert.equal(object.get('x'), 7);
      assert(object.op('x') instanceof Parse.Op.Increment);
      assert.equal(object.op('x')._amount, 7);

      object.set({ cat: { __op: 'Delete' }});
      assert(!object.has('cat'));
      assert(object.op('cat') instanceof Parse.Op.Unset);

      let Related = new Parse.Object.extend('RelatedObject');
      var relatedObjects = [];
      for (let i = 0; i < 5; i++) {
        relatedObjects.push(new Related({ i: i }));
      }
      Parse.Object.saveAll(relatedObjects).then(() => {
        object.set({
          relation: {
            __op: 'Batch',
            ops: [{
              __op: 'AddRelation',
              objects: [relatedObjects[0], relatedObjects[1]]
            }, {
              __op: 'AddRelation',
              objects: [relatedObjects[2], relatedObjects[3]]
            }]
          }
        });
        let relation = object.op('relation');
        assert(relation instanceof Parse.Op.Relation);
        assert.equal(relation.relationsToAdd.length, 4);

        object.set({
          relation: {
            __op: 'RemoveRelation',
            objects: [relatedObjects[1], relatedObjects[4]]
          }
        });

        relation = object.op('relation');
        assert(relation instanceof Parse.Op.Relation);
        assert.equal(relation.relationsToAdd.length, 3);
        assert.equal(relation.relationsToRemove.length, 2);

        done();
      });
    });
  });

  it('can repeatedly unset old attributes', (done) => {
    let obj = new TestObject();
    obj.set('x', 3);
    obj.save().then(() => {
      obj.unset('x');
      obj.unset('x');
      return obj.save();
    }).then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      let query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can repeatedly unset new attributes', (done) => {
    let obj = new TestObject();
    obj.set('x', 5);
    obj.unset('x');
    obj.unset('x');
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      let query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can repeatedly unset an unknown attributes', (done) => {
    let obj = new TestObject();
    obj.unset('x');
    obj.unset('x');
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      let query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can unset then clear old attributes', (done) => {
    let obj = new TestObject();
    obj.set('x', 3);
    obj.save().then(() => {
      obj.unset('x');
      obj.clear();
      return obj.save();
    }).then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      let query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can unset then clear new attributes', (done) => {
    let obj = new TestObject();
    obj.set('x', 5);
    obj.unset('x');
    obj.clear();
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      let query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can unset then clear unknown attributes', (done) => {
    let obj = new TestObject();
    obj.unset('x');
    obj.clear();
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      let query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can clear then unset old attributes', (done) => {
    let obj = new TestObject();
    obj.set('x', 3);
    obj.save().then(() => {
      obj.clear();
      obj.unset('x');
      return obj.save();
    }).then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      let query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can clear then unset new attributes', (done) => {
    let obj = new TestObject();
    obj.set('x', 5);
    obj.clear();
    obj.unset('x');
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      let query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can clear then unset unknown attributes', (done) => {
    let obj = new TestObject();
    obj.clear();
    obj.unset('x');
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      let query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can clear then clear old attributes', (done) => {
    let obj = new TestObject();
    obj.set('x', 3);
    obj.save().then(() => {
      obj.clear();
      obj.clear();
      return obj.save();
    }).then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      let query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can clear then clear new attributes', (done) => {
    let obj = new TestObject();
    obj.set('x', 5);
    obj.clear();
    obj.clear();
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      let query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can clear then clear unknown attributes', (done) => {
    let obj = new TestObject();
    obj.clear();
    obj.clear();
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      let query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can save children in an array', (done) => {
    let Parent = Parse.Object.extend('Parent');
    let Child = Parse.Object.extend('Child');

    let child1 = new Child();
    let child2 = new Child();
    let parent = new Parent();

    child1.set('name', 'jaime');
    child1.set('house', 'lannister');
    child2.set('name', 'cersei');
    child2.set('house', 'lannister');
    parent.set('children', [child1, child2]);

    parent.save().then(() => {
      let query = new Parse.Query(Child);
      query.equalTo('house', 'lannister');
      query.ascending('name');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 2);
      assert.equal(results[0].get('name'), 'cersei');
      assert.equal(results[1].get('name'), 'jaime');
      done();
    });
  });

  it('can do two saves at the same time', (done) => {
    let object = new TestObject();
    let firstSave = true;

    let success = () => {
      if (firstSave) {
        firstSave = false;
        return;
      }

      let query = new Parse.Query('TestObject');
      query.equalTo('test', 'doublesave');
      query.find().then((results) => {
        assert.equal(results.length, 1);
        assert.equal(results[0].get('cat'), 'meow');
        assert.equal(results[0].get('dog'), 'bark');
        done();
      });
    }

    object.save({ cat: 'meow', test: 'doublesave' }).then(success);
    object.save({ dog: 'bark', test: 'doublesave' }).then(success);
  });

  it('can achieve a save after failure', (done) => {
    let object = new TestObject();
    let other;
    object.set('number', 1);
    object.save().then(() => {
      other = new TestObject();
      other.set('number', 'two');
      return other.save();
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.INCORRECT_TYPE);
      other.set('number', 2);
      return other.save();
    }).then(() => {
      done();
    });
  });

  it('is not dirty after save', (done) => {
    let object = new TestObject();
    object.save().then(() => {
      object.set({ content: 'x' });
      assert(object.dirty('content'));
      return object.fetch();
    }).then(() => {
      assert(!object.dirty('content'));
      done();
    });
  });

  it('can add objects to an array', (done) => {
    let child = new Parse.Object('Person');
    let parent = new Parse.Object('Person');

    child.save().then(() => {
      parent.add('children', child);
      return parent.save();
    }).then(() => {
      let query = new Parse.Query('Person');
      return query.get(parent.id);
    }).then((p) => {
      assert.equal(p.get('children')[0].id, child.id);
      done();
    });
  });

  it('can add objects to an array in batch mode', (done) => {
    let child1 = new Parse.Object('Person');
    let child2 = new Parse.Object('Person');
    let parent = new Parse.Object('Person');

    Promise.all([child1.save(), child2.save()]).then((children) => {
      parent.addAll('children', children);
      return parent.save();
    }).then(() => {
      let query = new Parse.Query('Person');
      return query.get(parent.id);
    }).then((p) => {
      assert.equal(p.get('children')[0].id, child1.id);
      assert.equal(p.get('children')[1].id, child2.id);
      done();
    });
  });

  it('can convert saved objects to json', (done) => {
    let object = new TestObject();
    object.save({ foo: 'bar' }).then(() => {
      let json = object.toJSON();
      assert(json.foo);
      assert(json.objectId);
      assert(json.createdAt);
      assert(json.updatedAt);
      done();
    });
  });

  it('can convert unsaved objects to json', () => {
    let object = new TestObject();
    object.set({ foo: 'bar' });
    let json = object.toJSON();
    assert(json.foo);
    assert(!json.objectId);
    assert(!json.createdAt);
    assert(!json.updatedAt);
  });

  it('can remove objects from array fields', (done) => {
    let object = new TestObject();
    let container;
    object.save().then(() => {
      container = new TestObject();
      container.add('array', object);
      assert.equal(container.get('array').length, 1);
      return container.save();
    }).then(() => {
      let o = new TestObject();
      o.id = object.id;
      container.remove('array', o);
      assert.equal(container.get('array').length, 0);
      done();
    });
  });

  it('can remove objects from array fields in batch mode', (done) => {
    let obj1 = new TestObject();
    let obj2 = new TestObject();

    Promise.all([obj1.save(), obj2.save()]).then((objects) => {
      let container = new TestObject();
      container.addAll('array', objects);
      assert.equal(container.get('array').length, 2);
      return container.save();
    }).then((container) => {
      let o1 = new TestObject();
      o1.id = obj1.id;
      let o2 = new TestObject();
      o2.id = obj2.id;
      let o3 = new TestObject();
      o3.id = 'there_is_no_such_object'

      container.removeAll('array', [o1, o2, o3]);
      assert.equal(container.get('array').length, 0);
      done();
    });
  });

  it('can perform async methods', (done) => {
    let object = new TestObject();
    object.set('time', 'adventure');
    object.save().then(() => {
      assert(object.id);
      let again = new TestObject();
      again.id = object.id;
      return again.fetch();
    }).then((again) => {
      assert.equal(again.get('time'), 'adventure');
      return again.destroy();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      query.equalTo('objectId', object.id);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 0);
      done();
    });
  });

  it('fails validation with a promise', (done) => {
    let PickyEater = Parse.Object.extend('PickyEater', {
      validate: function(attrs) {
        if (attrs.meal === 'tomatoes') {
          return 'Ew. Gross.';
        }
        return Parse.Object.prototype.validate.apply(this, arguments);
      }
    });

    let bryan = new PickyEater();
    bryan.save({ meal: 'burrito' }).then(() => {
      return bryan.save({ meal: 'tomatoes' });
    }).catch((e) => {
      assert.equal(e, 'Ew. Gross.');
      done();
    });
  });

  it('works with bytes type', (done) => {
    let object = new TestObject();
    object.set('bytes', { __type: 'Bytes', base64: 'ZnJveW8=' });
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id)
    }).then((o) => {
      assert.equal(o.get('bytes').__type, 'Bytes');
      assert.equal(o.get('bytes').base64, 'ZnJveW8=');
      done();
    });
  });

  it('can destroyAll with no objects', (done) => {
    Parse.Object.destroyAll([]).then(() => {
      done();
    });
  });

  it('can destroyAll unsaved objects', (done) => {
    let objects = [new TestObject(), new TestObject()];
    Parse.Object.destroyAll(objects).then(() => {
      done();
    });
  });

  it('can destroyAll a single object', (done) => {
    let o = new TestObject();
    o.save().then(() => {
      return Parse.Object.destroyAll([o]);
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(o.id);
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('can destroyAll two batches', (done) => {
    let objects = [];
    for (let i = 0; i < 21; i++) {
      objects[i] = new TestObject();
    }
    Parse.Object.saveAll(objects).then(() => {
      return Parse.Object.destroyAll(objects);
    }).then(() => {
      let query = new Parse.Query(TestObject);
      query.containedIn('objectId', [objects[0].id, objects[20].id]);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 0);
      done();
    });
  });

  it('can destroyAll an object that does not exist', (done) => {
    let o = new TestObject();
    o.id = 'fakeobject';
    Parse.Object.destroyAll([o]).catch((e) => {
      assert.equal(e.code, Parse.Error.AGGREGATE_ERROR);
      assert.equal(e.errors.length, 1);
      done();
    });
  });

  it('can destroyAll two batches when the first object does not exist', (done) => {
    let objects = [];
    for (let i = 0; i < 21; i++) {
      objects[i] = new TestObject();
    }
    Parse.Object.saveAll(objects).then(() => {
      objects[0].id = 'fakeobject';
      return Parse.Object.destroyAll(objects);
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.AGGREGATE_ERROR);
      assert.equal(e.errors.length, 1);
      assert.equal(e.errors[0].code, Parse.Error.OBJECT_NOT_FOUND);
      assert.equal(e.errors[0].object, objects[0]);
      done();
    });
  });

  it('can destroyAll two batches when a middle object does not exist', (done) => {
    let objects = [];
    for (let i = 0; i < 21; i++) {
      objects[i] = new TestObject();
    }
    Parse.Object.saveAll(objects).then(() => {
      objects[19].id = 'fakeobject';
      return Parse.Object.destroyAll(objects);
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.AGGREGATE_ERROR);
      assert.equal(e.errors.length, 1);
      assert.equal(e.errors[0].code, Parse.Error.OBJECT_NOT_FOUND);
      assert.equal(e.errors[0].object, objects[19]);
      done();
    });
  });

  it('can destroyAll two batches when the last object does not exist', (done) => {
    let objects = [];
    for (let i = 0; i < 21; i++) {
      objects[i] = new TestObject();
    }
    Parse.Object.saveAll(objects).then(() => {
      objects[20].id = 'fakeobject';
      return Parse.Object.destroyAll(objects);
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.AGGREGATE_ERROR);
      assert.equal(e.errors.length, 1);
      assert.equal(e.errors[0].code, Parse.Error.OBJECT_NOT_FOUND);
      assert.equal(e.errors[0].object, objects[20]);
      done();
    });
  });

  it('can destroyAll two batches with multiple missing objects', (done) => {
    let objects = [];
    for (let i = 0; i < 21; i++) {
      objects[i] = new TestObject();
    }
    Parse.Object.saveAll(objects).then(() => {
      objects[0].id = 'fakeobject';
      objects[19].id = 'fakeobject';
      objects[20].id = 'fakeobject';
      return Parse.Object.destroyAll(objects);
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.AGGREGATE_ERROR);
      assert.equal(e.errors.length, 3);
      assert.equal(e.errors[0].code, Parse.Error.OBJECT_NOT_FOUND);
      assert.equal(e.errors[1].code, Parse.Error.OBJECT_NOT_FOUND);
      assert.equal(e.errors[2].code, Parse.Error.OBJECT_NOT_FOUND);
      assert.equal(e.errors[0].object, objects[0]);
      assert.equal(e.errors[1].object, objects[19]);
      assert.equal(e.errors[2].object, objects[20]);
      done();
    });
  });

  it('can fetchAll', (done) => {
    let numItems = 11;
    let container = new Container();
    let items = [];
    for (let i = 0; i < numItems; i++) {
      let item = new Item();
      item.set('x', i);
      items.push(item);
    }
    Parse.Object.saveAll(items).then(() => {
      container.set('items', items);
      return container.save();
    }).then(() => {
      let query = new Parse.Query(Container);
      return query.get(container.id);
    }).then((containerAgain) => {
      let itemsAgain = containerAgain.get('items');
      assert.equal(itemsAgain.length, numItems);
      itemsAgain.forEach((item, i) => {
        let newValue = i * 2;
        item.set('x', newValue);
      });
      return Parse.Object.saveAll(itemsAgain);
    }).then(() => {
      return Parse.Object.fetchAll(items);
    }).then((itemsAgain) => {
      assert.equal(itemsAgain.length, numItems);
      itemsAgain.forEach((item, i) => {
        assert.equal(item.get('x'), i * 2);
      });
      done();
    });
  });

  it('can fetchAll with no objects', (done) => {
    Parse.Object.fetchAll([]).then(() => {
      done();
    });
  });

  it('updates dates on fetchAll', (done) => {
    let updated;
    let object = new TestObject();
    object.set('x', 7);
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((result) => {
      updated = result;
      updated.set('x', 11);
      return updated.save();
    }).then(() => {
      return Parse.Object.fetchAll([object]);
    }).then(() => {
      assert.equal(object.createdAt.getTime(), updated.createdAt.getTime());
      assert.equal(object.updatedAt.getTime(), updated.updatedAt.getTime());
      done();
    });
  });

  it('fails fetchAll on multiple classes', () => {
    let container = new Container();
    container.set('item', new Item());
    container.set('subcontainer', new Container());
    return container.save().then(() => {
      let query = new Parse.Query(Container);
      return query.get(container.id);
    }).then((containerAgain) => {
      let subContainerAgain = containerAgain.get('subcontainer');
      let itemAgain = containerAgain.get('item');
      let multiClassArray = [subContainerAgain, itemAgain];
      return Parse.Object.fetchAll(multiClassArray);
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.INVALID_CLASS_NAME);
    });
  });

  it('fails fetchAll on unsaved object', () => {
    let unsavedObjectArray = [new TestObject()];
    return Parse.Object.fetchAll(unsavedObjectArray).catch((e) => {
      assert.equal(e.code, Parse.Error.MISSING_OBJECT_ID);
    });
  });

  it('fails fetchAll on deleted object', (done) => {
    let numItems = 11;
    let container = new Container();
    let subContainer = new Container();
    let items = [];
    for (let i = 0; i < numItems; i++) {
      let item = new Item();
      item.set('x', i);
      items.push(item);
    }
    Parse.Object.saveAll(items).then(() => {
      let query = new Parse.Query(Item);
      return query.get(items[0].id);
    }).then((objectToDelete) => {
      return objectToDelete.destroy();
    }).then((deletedObject) => {
      let nonExistentObject = new Item({ objectId: deletedObject.id });
      let nonExistentObjectArray = [nonExistentObject, items[1]];
      return Parse.Object.fetchAll(nonExistentObjectArray);
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('merges user attributes on fetchAll', (done) => {
    Parse.User.enableUnsafeCurrentUser();
    let sameUser;
    let user = new Parse.User();
    user.set('username', 'asdf');
    user.set('password', 'zxcv');
    user.set('foo', 'bar');
    user.signUp().then(() => {
      Parse.User.logOut();
      let query = new Parse.Query(Parse.User);
      return query.get(user.id);
    }).then((userAgain) => {
      user = userAgain;
      sameUser = new Parse.User();
      sameUser.set('username', 'asdf');
      sameUser.set('password', 'zxcv');
      return sameUser.logIn();
    }).then(() => {
      assert(!user.getSessionToken());
      assert(sameUser.getSessionToken());
      sameUser.set('baz', 'qux');
      return sameUser.save();
    }).then(() => {
      return Parse.Object.fetchAll([user]);
    }).then(() => {
      assert.equal(user.createdAt.getTime(), sameUser.createdAt.getTime());
      assert.equal(user.updatedAt.getTime(), sameUser.updatedAt.getTime());
      return Parse.User.logOut().then(() => { done(); }, () => { done(); });
    }).catch(done.fail);
  });

  it('can fetchAllIfNeeded', (done) => {
    let numItems = 11;
    let container = new Container();
    let items = [];
    for (let i = 0; i < numItems; i++) {
      let item = new Item();
      item.set('x', i);
      items.push(item);
    }
    Parse.Object.saveAll(items).then(() => {
      container.set('items', items);
      return container.save();
    }).then(() => {
      let query = new Parse.Query(Container);
      return query.get(container.id);
    }).then((containerAgain) => {
      let itemsAgain = containerAgain.get('items');
      itemsAgain.forEach((item, i) => {
        item.set('x', i * 2);
      });
      return Parse.Object.saveAll(itemsAgain);
    }).then(() => {
      return Parse.Object.fetchAllIfNeeded(items);
    }).then((fetchedItems) => {
      assert.equal(fetchedItems.length, numItems);
      fetchedItems.forEach((item, i) => {
        assert.equal(item.get('x'), i);
      });
      done();
    });
  });

  it('can fetchAllIfNeeded with no objects', (done) => {
    Parse.Object.fetchAllIfNeeded([]).then(() => {
      done();
    });
  });

  it('can fetchAllIfNeeded with an unsaved object', () => {
    let unsavedObjectArray = [new TestObject()];
    Parse.Object.fetchAllIfNeeded(unsavedObjectArray).catch((e) => {
      assert.equal(e.code, Parse.Error.MISSING_OBJECT_ID);
      done();
    });
  });

  it('fails fetchAllIfNeeded on multiple classes', () => {
    let container = new Container();
    container.set('item', new Item());
    container.set('subcontainer', new Container());
    return container.save().then(() => {
      let query = new Parse.Query(Container);
      return query.get(container.id);
    }).then((containerAgain) => {
      let subContainerAgain = containerAgain.get('subcontainer');
      let itemAgain = containerAgain.get('item');
      let multiClassArray = [subContainerAgain, itemAgain];
      return Parse.Object.fetchAllIfNeeded(multiClassArray);
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.INVALID_CLASS_NAME);
    });
  });

  it('can rewrite the User classname', (done) => {
    assert.equal(Parse.CoreManager.get('PERFORM_USER_REWRITE'), true);
    let User1 = Parse.Object.extend({
      className: 'User'
    });

    assert.equal(User1.className, '_User');

    Parse.User.allowCustomUserClass(true);
    assert.equal(Parse.CoreManager.get('PERFORM_USER_REWRITE'), false);
    let User2 = Parse.Object.extend({
      className: 'User'
    });

    assert.equal(User2.className, 'User');

    Parse.User.allowCustomUserClass(false);
    assert.equal(Parse.CoreManager.get('PERFORM_USER_REWRITE'), true);

    let user = new User2();
    user.set('name', 'Me');
    user.save({ height: 181 }).then(() => {
      assert.equal(user.get('name'), 'Me');
      assert.equal(user.get('height'), 181);

      let query = new Parse.Query(User2);
      return query.get(user.id);
    }).then((u) => {
      assert.equal(user.className, 'User');
      assert.equal(user.get('name'), 'Me');
      assert.equal(user.get('height'), 181);

      done();
    });
  });

  it('can create objects without data', (done) => {
    let t1 = new TestObject({ test: 'test' });
    t1.save().then(() => {
      let t2 = TestObject.createWithoutData(t1.id);
      return t2.fetch();
    }).then((t2) => {
      assert.equal(t2.get('test'), 'test');
      let t3 = TestObject.createWithoutData(t2.id);
      t3.set('test', 'not test');
      return t3.fetch();
    }).then((t3) => {
      assert.equal(t3.get('test'), 'test');
      done();
    });
  });

  it('can fetchWithInclude', async () => {
    const parent = new TestObject();
    const child = new TestObject();
    child.set('field', 'isChild');
    parent.set('child', child);
    await parent.save();

    const obj1 = TestObject.createWithoutData(parent.id);
    const fetchedObj1 = await obj1.fetchWithInclude('child');
    assert.equal(obj1.get('child').get('field'), 'isChild');
    assert.equal(fetchedObj1.get('child').get('field'), 'isChild');

    const obj2 = TestObject.createWithoutData(parent.id);
    const fetchedObj2 = await obj2.fetchWithInclude(['child']);
    assert.equal(obj2.get('child').get('field'), 'isChild');
    assert.equal(fetchedObj2.get('child').get('field'), 'isChild');

    const obj3 = TestObject.createWithoutData(parent.id);
    const fetchedObj3 = await obj3.fetchWithInclude([ ['child'] ]);
    assert.equal(obj3.get('child').get('field'), 'isChild');
    assert.equal(fetchedObj3.get('child').get('field'), 'isChild');
  });

  it('can fetchWithInclude dot notation', async () => {
    const parent = new TestObject();
    const child = new TestObject();
    const grandchild = new TestObject();
    grandchild.set('field', 'isGrandchild');
    child.set('grandchild', grandchild);
    parent.set('child', child);
    await Parse.Object.saveAll([parent, child, grandchild]);

    const obj1 = TestObject.createWithoutData(parent.id);
    await obj1.fetchWithInclude('child.grandchild');
    assert.equal(obj1.get('child').get('grandchild').get('field'), 'isGrandchild');

    const obj2 = TestObject.createWithoutData(parent.id);
    await obj2.fetchWithInclude(['child.grandchild']);
    assert.equal(obj2.get('child').get('grandchild').get('field'), 'isGrandchild');

    const obj3 = TestObject.createWithoutData(parent.id);
    await obj3.fetchWithInclude([ ['child.grandchild'] ]);
    assert.equal(obj3.get('child').get('grandchild').get('field'), 'isGrandchild');
  });

  it('can fetchAllWithInclude', async () => {
    const parent = new TestObject();
    const child = new TestObject();
    child.set('field', 'isChild');
    parent.set('child', child);
    await parent.save();

    const obj1 = TestObject.createWithoutData(parent.id);
    await Parse.Object.fetchAllWithInclude([obj1], 'child');
    assert.equal(obj1.get('child').get('field'), 'isChild');

    const obj2 = TestObject.createWithoutData(parent.id);
    await Parse.Object.fetchAllWithInclude([obj2], ['child']);
    assert.equal(obj2.get('child').get('field'), 'isChild');

    const obj3 = TestObject.createWithoutData(parent.id);
    await Parse.Object.fetchAllWithInclude([obj3], [ ['child'] ]);
    assert.equal(obj3.get('child').get('field'), 'isChild');
  });

  it('can fetchAllWithInclude dot notation', async () => {
    const parent = new TestObject();
    const child = new TestObject();
    const grandchild = new TestObject();
    grandchild.set('field', 'isGrandchild');
    child.set('grandchild', grandchild);
    parent.set('child', child);
    await Parse.Object.saveAll([parent, child, grandchild]);

    const obj1 = TestObject.createWithoutData(parent.id);
    await Parse.Object.fetchAllWithInclude([obj1], 'child.grandchild');
    assert.equal(obj1.get('child').get('grandchild').get('field'), 'isGrandchild');

    const obj2 = TestObject.createWithoutData(parent.id);
    await Parse.Object.fetchAllWithInclude([obj2], ['child.grandchild']);
    assert.equal(obj2.get('child').get('grandchild').get('field'), 'isGrandchild');

    const obj3 = TestObject.createWithoutData(parent.id);
    await Parse.Object.fetchAllWithInclude([obj3], [ ['child.grandchild'] ]);
    assert.equal(obj3.get('child').get('grandchild').get('field'), 'isGrandchild');
  });

  it('fires errors when readonly attributes are changed', (done) => {
    let LimitedObject = Parse.Object.extend('LimitedObject');
    LimitedObject.readOnlyAttributes = function() {
      return ['immutable'];
    };

    let lo = new LimitedObject();
    try {
      lo.set('immutable', 'mutable');
    } catch (e) {
      done();
    }
  });

  it('fires errors when readonly attributes are unset', (done) => {
    let LimitedObject = Parse.Object.extend('LimitedObject');
    LimitedObject.readOnlyAttributes = function() {
      return ['immutable'];
    };

    let lo = new LimitedObject();
    try {
      lo.unset('immutable');
    } catch (e) {
      done();
    }
  });
  
  const controllers = [
    { name: 'In-Memory', file: require(path.resolve(__dirname, '../../lib/node/LocalDatastoreController.default')) },
    { name: 'LocalStorage', file: require(path.resolve(__dirname, '../../lib/node/LocalDatastoreController.localStorage')) }
  ];

  for (let i = 0; i < controllers.length; i += 1) {
    const controller = controllers[i];

    describe(`Parse Object Pinning (${controller.name})`, () => {
      beforeEach(() => {
        const StorageController = controller.file;
        Parse.CoreManager.setLocalDatastoreController(StorageController);
      });

      it(`${controller.name} can pin (unsaved)`, async () => {
        const object = new TestObject();
        object.pin();
        // Since object not saved check localId
        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 2);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [object._localId]);
        assert.deepEqual(localDatastore[object._localId], object._toFullJSON());
        await object.save();
        // Check if localDatastore updated localId to objectId
        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 2);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [object.id]);
        assert.deepEqual(localDatastore[object.id], object._toFullJSON());
      });

      it(`${controller.name} cannot pin unsaved pointer`, () => {
        try {
          const object = new TestObject();
          const pointer = new Item();
          object.set('child', pointer);
          object.pin();
        } catch (e) {
          assert.equal(e.message, 'Cannot create a pointer to an unsaved ParseObject');
        }
      });

      it(`${controller.name} can pin (saved)`, async () => {
        const object = new TestObject();
        object.set('field', 'test');
        await object.save();
        object.pin();
        const localDatastore = Parse.LocalDatastore._getLocalDatastore();
        const cachedObject = localDatastore[object.id];
        assert.equal(Object.keys(localDatastore).length, 2);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [object.id]);
        assert.deepEqual(localDatastore[object.id], object._toFullJSON());
        assert.equal(cachedObject.objectId, object.id);
        assert.equal(cachedObject.field, 'test');
      });

      it(`${controller.name} can pin (twice saved)`, async () => {
        const object = new TestObject();
        object.set('field', 'test');
        await object.save();

        object.pin();
        object.set('field', 'new info');
        await object.save();
      
        const localDatastore = Parse.LocalDatastore._getLocalDatastore();
        const cachedObject = localDatastore[object.id];
        assert.equal(Object.keys(localDatastore).length, 2);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [object.id]);
        assert.deepEqual(localDatastore[object.id], object._toFullJSON());
        assert.equal(cachedObject.objectId, object.id);
        assert.equal(cachedObject.field, 'new info');
      });

      it(`${controller.name} can pin (recursive)`, async () => {
        const parent = new TestObject();
        const child = new Item();
        const grandchild = new Item();
        child.set('grandchild', grandchild);
        parent.set('field', 'test');
        parent.set('child', child);
        await Parse.Object.saveAll([parent, child, grandchild]);
        parent.pin();
        const localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.equal(localDatastore[DEFAULT_PIN].includes(parent.id), true);
        assert.equal(localDatastore[DEFAULT_PIN].includes(child.id), true);
        assert.equal(localDatastore[DEFAULT_PIN].includes(grandchild.id), true);
        assert.deepEqual(localDatastore[parent.id], parent._toFullJSON());
        assert.deepEqual(localDatastore[child.id], child._toFullJSON());
        assert.deepEqual(localDatastore[grandchild.id], grandchild._toFullJSON());
      });
      
      it(`${controller.name} can pinAll (unsaved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];

        Parse.Object.pinAll(objects);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj1._localId, obj2._localId, obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        await Parse.Object.saveAll(objects);

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj1.id, obj2.id, obj3.id]);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2.id], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} can pinAll (saved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];

        await Parse.Object.saveAll(objects);

        Parse.Object.pinAll(objects);
        const localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj1.id, obj2.id, obj3.id]);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2.id], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} can pinAllWithName (unsaved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];

        Parse.Object.pinAllWithName('test_pin', objects);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[PIN_PREFIX + 'test_pin'], [obj1._localId, obj2._localId, obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        await Parse.Object.saveAll(objects);

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[PIN_PREFIX + 'test_pin'], [obj1.id, obj2.id, obj3.id]);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2.id], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} can pinAllWithName (saved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];
        await Parse.Object.saveAll(objects);

        Parse.Object.pinAllWithName('test_pin', objects);
        const localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[PIN_PREFIX + 'test_pin'], [obj1.id, obj2.id, obj3.id]);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2.id], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} can unPin on destroy`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        obj1.pin();
        obj2.pin();
        obj1.pinWithName('test_pin');
        obj2.pinWithName('test_pin');

        await Parse.Object.saveAll([obj1, obj2]);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert(Object.keys(localDatastore).length === 4);
        assert.equal(localDatastore[DEFAULT_PIN].includes(obj1.id), true);
        assert.equal(localDatastore[DEFAULT_PIN].includes(obj2.id), true);
        assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(obj1.id), true);
        assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(obj2.id), true);
        assert(localDatastore[obj1.id]);
        assert(localDatastore[obj2.id]);

        await obj1.destroy();
        
        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert(Object.keys(localDatastore).length === 3);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj2.id]);
        assert.deepEqual(localDatastore[PIN_PREFIX + 'test_pin'], [obj2.id]);
        assert(localDatastore[obj2.id]);
      });

      it(`${controller.name} can unPin on destroyAll`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];
        Parse.Object.pinAll(objects);
        Parse.Object.pinAllWithName('test_pin', objects);
        await Parse.Object.saveAll(objects);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert(Object.keys(localDatastore).length === 5);
        assert.equal(localDatastore[DEFAULT_PIN].includes(obj1.id), true);
        assert.equal(localDatastore[DEFAULT_PIN].includes(obj2.id), true);
        assert.equal(localDatastore[DEFAULT_PIN].includes(obj3.id), true);
        assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(obj1.id), true);
        assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(obj2.id), true);
        assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(obj3.id), true);
        assert(localDatastore[obj1.id]);
        assert(localDatastore[obj2.id]);
        assert(localDatastore[obj3.id]);

        await Parse.Object.destroyAll([obj1, obj3]);

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert(Object.keys(localDatastore).length === 3);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj2.id]);
        assert.deepEqual(localDatastore[PIN_PREFIX + 'test_pin'], [obj2.id]);
        assert(localDatastore[obj2.id]);
      });

      it(`${controller.name} can unPin with pinAll (unsaved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];

        Parse.Object.pinAll(objects);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj1._localId, obj2._localId, obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        obj2.unPin();

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj1._localId, obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());
        
        await Parse.Object.saveAll(objects);

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj1.id, obj3.id]);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} can unPin with pinAll (saved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];

        Parse.Object.pinAll(objects);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj1._localId, obj2._localId, obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        await Parse.Object.saveAll(objects);

        obj2.unPin();

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj1.id, obj3.id]);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2.id], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} can unPin / unPinAll without pin (unsaved)`, () => {
        const obj1 = new TestObject();
        obj1.unPin();
        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 1);
        assert(localDatastore[DEFAULT_PIN]);

        const obj2 = new TestObject();
        const obj3 = new TestObject();
        Parse.Object.unPinAll([obj2, obj3]);
        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 1);
        assert(localDatastore[DEFAULT_PIN]);
      });

      it(`${controller.name} can unPin / unPinAll without pin (saved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const unPinObject = new TestObject();

        const objects = [obj1, obj2, obj3];

        await Parse.Object.saveAll(objects);

        Parse.Object.unPinAll(objects);
        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 1);
        assert.deepEqual(localDatastore[DEFAULT_PIN], []);

        await unPinObject.save();
        unPinObject.unPin();

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 1);
        assert.deepEqual(localDatastore[DEFAULT_PIN], []);
      });

      it(`${controller.name} can unPinAll (unsaved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];

        Parse.Object.pinAll(objects);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert(Object.keys(localDatastore).length === 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj1._localId, obj2._localId, obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        Parse.Object.unPinAll([obj1, obj2]);

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        await Parse.Object.saveAll(objects);

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj3.id]);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2.id], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} can unPinAll (saved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];

        Parse.Object.pinAll(objects);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj1._localId, obj2._localId, obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        await Parse.Object.saveAll(objects);

        Parse.Object.unPinAll([obj1, obj2]);
        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj3.id]);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2.id], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} can unPinAllObjects (unsaved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];

        Parse.Object.pinAll(objects);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert(Object.keys(localDatastore).length === 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj1._localId, obj2._localId, obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        Parse.Object.unPinAllObjects();

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 3);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        await Parse.Object.saveAll(objects);

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 3);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2.id], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} can unPinAllObjects (saved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];

        Parse.Object.pinAll(objects);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[DEFAULT_PIN], [obj1._localId, obj2._localId, obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        await Parse.Object.saveAll(objects);

        Parse.Object.unPinAllObjects();
        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 3);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2.id], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} can unPinAllWithName (unsaved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];

        Parse.Object.pinAllWithName('test_unpin', objects);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert(Object.keys(localDatastore).length === 4);
        assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [obj1._localId, obj2._localId, obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        Parse.Object.unPinAllWithName('test_unpin', [obj1, obj2]);

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        await Parse.Object.saveAll(objects);

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [obj3.id]);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2.id], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} can unPinAllWithName (saved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];

        Parse.Object.pinAllWithName('test_unpin', objects);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [obj1._localId, obj2._localId, obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        await Parse.Object.saveAll(objects);

        Parse.Object.unPinAllWithName('test_unpin', [obj1, obj2]);
        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [obj3.id]);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2.id], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} can unPinAllObjectsWithName (unsaved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];

        Parse.Object.pinAllWithName('test_unpin', objects);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert(Object.keys(localDatastore).length === 4);
        assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [obj1._localId, obj2._localId, obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        Parse.Object.unPinAllObjectsWithName('test_unpin');

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 3);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        await Parse.Object.saveAll(objects);

        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 3);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2.id], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} can unPinAllObjectsWithName (saved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();
        const obj3 = new TestObject();
        const objects = [obj1, obj2, obj3];

        Parse.Object.pinAllWithName('test_unpin', objects);

        let localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 4);
        assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [obj1._localId, obj2._localId, obj3._localId]);
        assert.deepEqual(localDatastore[obj1._localId], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2._localId], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3._localId], obj3._toFullJSON());

        await Parse.Object.saveAll(objects);

        Parse.Object.unPinAllObjectsWithName('test_unpin');
        localDatastore = Parse.LocalDatastore._getLocalDatastore();
        assert.equal(Object.keys(localDatastore).length, 3);
        assert.deepEqual(localDatastore[obj1.id], obj1._toFullJSON());
        assert.deepEqual(localDatastore[obj2.id], obj2._toFullJSON());
        assert.deepEqual(localDatastore[obj3.id], obj3._toFullJSON());
      });

      it(`${controller.name} cannot fetchFromLocalDatastore (unsaved)`, () => {
        try {
          const object = new TestObject();
          object.fetchFromLocalDatastore();
        } catch (e) {
          assert.equal(e.message, 'Cannot fetch an unsaved ParseObject');
        }
      });

      it(`${controller.name} cannot fetchFromLocalDatastore (pinned but not saved)`, () => {
        try {
          const object = new TestObject();
          object.pin();
          object.fetchFromLocalDatastore();
        } catch (e) {
          assert.equal(e.message, 'Cannot fetch an unsaved ParseObject');
        }
      });

      it(`${controller.name} can fetchFromLocalDatastore (saved)`, async () => {
        const obj1 = new TestObject();
        const obj2 = new TestObject();

        obj1.set('field', 'test');
        obj1.pin();
        await obj1.save();

        obj2.id = obj1.id;
        obj2.fetchFromLocalDatastore();
        assert.deepEqual(obj1.toJSON(), obj2.toJSON());
        assert.deepEqual(obj1._toFullJSON(), obj2._toFullJSON());

        const obj3 = TestObject.createWithoutData(obj1.id);
        obj3.fetchFromLocalDatastore();
        assert.deepEqual(obj1.toJSON(), obj3.toJSON());
        assert.deepEqual(obj1._toFullJSON(), obj3._toFullJSON());

        const obj4 = TestObject.createWithoutData(obj1.id);
        obj4.set('field', 'no override');
        obj4.fetchFromLocalDatastore();
        assert.deepEqual(obj1.toJSON(), obj4.toJSON());
        assert.deepEqual(obj1._toFullJSON(), obj4._toFullJSON());
      });
    });
  }
});
