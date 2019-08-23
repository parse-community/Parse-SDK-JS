'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');
const Item = Parse.Object.extend('Item');
const Container = Parse.Object.extend('Container');

describe('Parse Object', () => {
  beforeEach((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => {
      done();
    });
  });

  it('can create objects', (done) => {
    const object = new TestObject({ test: 'test' });
    object.save().then((o) => {
      assert(o);
      assert(o.id);
      assert.equal(o.get('test'), 'test');
      done();
    });
  });

  it('can update objects', (done) => {
    const object = new TestObject({ test: 'test' });
    object.save().then((o) => {
      const o2 = new TestObject({ objectId: o.id });
      o2.set('test', 'changed');
      return o2.save();
    }).then((o) => {
      assert.equal(o.get('test'), 'changed');
      done();
    });
  });

  it('can save a cycle', (done) => {
    const a = new TestObject();
    const b = new TestObject();
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
    const object = new TestObject({ test: 'test' });
    object.save().then(() => {
      const query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('test'), 'test');
      assert.equal(o.id, object.id);
      done();
    });
  });

  it('can delete an object', (done) => {
    const object = new TestObject({ test: 'test' });
    object.save().then(() => {
      return object.destroy();
    }).then(() => {
      return object.fetch();
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('can check if object exists', async () => {
    const object = new TestObject();
    assert.equal(await object.exists(), false);
    await object.save();
    assert.equal(await object.exists(), true);
    await object.destroy();
    assert.equal(await object.exists(), false);
  });

  it('can find objects', (done) => {
    const object = new TestObject({ foo: 'bar' });
    object.save().then(() => {
      const query = new Parse.Query(TestObject);
      query.equalTo('foo', 'bar');
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      done();
    });
  });

  it('can establish relational fields', (done) => {
    const item = new Item();
    item.set('property', 'x');
    const container = new Container();
    container.set('item', item);

    Parse.Object.saveAll([item, container]).then(() => {
      const query = new Parse.Query(Container);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 1);
      const containerAgain = results[0];
      const itemAgain = containerAgain.get('item');
      return itemAgain.fetch();
    }).then((itemAgain) => {
      assert.equal(itemAgain.get('property'), 'x');
      done();
    });
  });

  it('adds no fields on save (beyond createdAt and updatedAt)', (done) => {
    const object = new TestObject();
    object.save().then(() => {
      const attributes = object.attributes;
      assert(attributes.createdAt);
      assert(attributes.updatedAt);
      const keys = Object.keys(attributes);
      assert.equal(keys.length, 2);
      done();
    });
  });

  it('can perform a recursive save', (done) => {
    const item = new Item();
    item.set('property', 'x');
    const container = new Container();
    container.set('item', item);

    container.save().then(() => {
      const query = new Parse.Query(Container);
      return query.get(container.id);
    }).then((result) => {
      assert(result);
      const containerAgain = result;
      const itemAgain = containerAgain.get('item');
      return itemAgain.fetch();
    }).then((itemAgain) => {
      assert.equal(itemAgain.get('property'), 'x');
      done();
    });
  });

  it('can fetch server data', (done) => {
    const item = new Item({ foo: 'bar' });
    item.save().then(() => {
      const itemAgain = new Item();
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
    const object = new Parse.Object('SimpleObject');
    object.set('foo', 'bar');
    object.set('test', 'foo');
    let object1 = null;
    let object2 = null;
    object.save().then(() => {
      const query = new Parse.Query('SimpleObject');
      return query.get(object.id);
    }).then((o) => {
      object1 = o;
      const query = new Parse.Query('SimpleObject');
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
    const object = new TestObject({ foo: 'bar' });
    object.save().then(() => {
      const objectAgain = new TestObject();
      objectAgain.id = object.id;
      return objectAgain.fetch();
    }).then((o) => {
      assert.equal(o.createdAt.getTime(), object.createdAt.getTime());
      done();
    });
  });

  it('exposes createdAt and updatedAt as top level properties', (done) => {
    const object = new TestObject({ foo: 'bar' });
    object.save().then(() => {
      assert(object.updatedAt);
      assert(object.createdAt);
      done();
    });
  });

  it('produces a reasonable createdAt time', (done) => {
    const start = new Date();
    const object = new TestObject({ foo: 'bar' });
    object.save().then(() => {
      const end = new Date();
      const startDiff = Math.abs(start.getTime() - object.createdAt.getTime());
      const endDiff = Math.abs(end.getTime() - object.createdAt.getTime());
      expect(startDiff).toBeLessThan(500);
      expect(startDiff).toBeGreaterThan(0);
      expect(endDiff).toBeLessThan(500);
      expect(endDiff).toBeGreaterThan(0);
      done();
    });
  });

  it('can increment nested fields', async () => {
    const obj = new TestObject();
    obj.set('objectField', { number: 5 });
    assert.equal(obj.get('objectField').number, 5);
    await obj.save();

    obj.increment('objectField.number', 15);
    assert.equal(obj.get('objectField').number, 20);
    await obj.save();

    assert.equal(obj.get('objectField').number, 20);

    const query = new Parse.Query(TestObject);
    const result = await query.get(obj.id);
    assert.equal(result.get('objectField').number, 20);
  });

  it('can increment non existing field', async () => {
    const obj = new TestObject();
    obj.set('objectField', { number: 5 });
    await obj.save();

    obj.increment('objectField.unknown', 15);
    assert.deepEqual(obj.get('objectField'), {
      number: 5,
      unknown: 15,
    });
    await obj.save();

    const query = new Parse.Query(TestObject);
    const result = await query.get(obj.id);
    assert.equal(result.get('objectField').number, 5);
    assert.equal(result.get('objectField').unknown, 15);
  });

  it('can increment nested fields two levels', async () => {
    const obj = new TestObject();
    obj.set('objectField', { foo: { bar: 5 } });
    assert.equal(obj.get('objectField').foo.bar, 5);
    await obj.save();

    obj.increment('objectField.foo.bar', 15);
    assert.equal(obj.get('objectField').foo.bar, 20);
    await obj.save();

    assert.equal(obj.get('objectField').foo.bar, 20);

    const query = new Parse.Query(TestObject);
    const result = await query.get(obj.id);
    assert.equal(result.get('objectField').foo.bar, 20);
  });

  it('can increment nested fields without object', async () => {
    const obj = new TestObject();
    obj.set('hello', 'world');
    await obj.save();

    obj.increment('hello.dot', 15);
    try  {
      await obj.save();
      assert.equal(false, true);
    } catch(error) {
      assert.equal(error.message, "Cannot create property 'dot' on string 'world'");
    }
  });

  it('can set nested fields', async () => {
    const obj = new TestObject({ objectField: { number: 5 } });
    assert.equal(obj.get('objectField').number, 5);
    await obj.save();

    assert.equal(obj.get('objectField').number, 5);
    obj.set('objectField.number', 20);
    assert.equal(obj.get('objectField').number, 20);
    await obj.save();

    const query = new Parse.Query(TestObject);
    const result = await query.get(obj.id);
    assert.equal(result.get('objectField').number, 20);
  });

  it('can set non existing fields', async () => {
    const obj = new TestObject();
    obj.set('objectField', { number: 5 });
    await obj.save();

    obj.set('objectField.unknown', 20);
    await obj.save();
    const query = new Parse.Query(TestObject);
    const result = await query.get(obj.id);
    assert.equal(result.get('objectField').number, 5);
    assert.equal(result.get('objectField').unknown, 20);
  });

  it('ignore set nested fields on new object', async () => {
    const obj = new TestObject();
    obj.set('objectField.number', 5);
    assert.deepEqual(obj._getPendingOps()[0], {});
    assert.equal(obj.get('objectField'), undefined);

    await obj.save();
    assert.equal(obj.get('objectField'), undefined);
  });

  it('can set nested fields two levels', async () => {
    const obj = new TestObject({ objectField: { foo: { bar: 5 } } });
    assert.equal(obj.get('objectField').foo.bar, 5);
    await obj.save();

    assert.equal(obj.get('objectField').foo.bar, 5);
    obj.set('objectField.foo.bar', 20);
    assert.equal(obj.get('objectField').foo.bar, 20);
    await obj.save();

    const query = new Parse.Query(TestObject);
    const result = await query.get(obj.id);
    assert.equal(result.get('objectField').foo.bar, 20);
  });

  it('can unset nested fields', async () => {
    const obj = new TestObject({
      objectField: {
        number: 5,
        string: 'hello',
      }
    });
    await obj.save();

    obj.unset('objectField.number');
    assert.equal(obj.get('objectField').number, undefined);
    assert.equal(obj.get('objectField').string, 'hello');
    await obj.save();

    const query = new Parse.Query(TestObject);
    const result = await query.get(obj.id);
    assert.equal(result.get('objectField').number, undefined);
    assert.equal(result.get('objectField').string, 'hello');
  });

  it('can unset nested fields two levels', async () => {
    const obj = new TestObject({
      objectField: {
        foo: {
          bar: 5,
        },
        string: 'hello',
      }
    });
    await obj.save();

    obj.unset('objectField.foo.bar');
    assert.equal(obj.get('objectField').foo.bar, undefined);
    assert.equal(obj.get('objectField').string, 'hello');
    await obj.save();

    const query = new Parse.Query(TestObject);
    const result = await query.get(obj.id);
    assert.equal(result.get('objectField').foo.bar, undefined);
    assert.equal(result.get('objectField').string, 'hello');
  });

  it('can unset non existing fields', async () => {
    const obj = new TestObject();
    obj.set('objectField', { number: 5 });
    await obj.save();

    obj.unset('objectField.unknown');
    await obj.save();

    const query = new Parse.Query(TestObject);
    const result = await query.get(obj.id);
    assert.equal(result.get('objectField').number, 5);
    assert.equal(result.get('objectField').unknown, undefined);
  });

  it('can set keys to null', (done) => {
    const obj = new TestObject();
    obj.set('foo', null);
    obj.save().then(() => {
      assert.equal(obj.get('foo'), null);
      done();
    });
  });

  it('can set boolean fields', (done) => {
    const obj = new TestObject();
    obj.set('yes', true);
    obj.set('no', false);
    obj.save().then(() => {
      assert.equal(obj.get('yes'), true);
      assert.equal(obj.get('no'), false);
      done();
    });
  });

  it('cannot set an invalid date', (done) => {
    const obj = new TestObject();
    obj.set('when', new Date(Date.parse(null)));
    obj.save().catch(() => {
      done();
    });
  });

  it('cannot create invalid class names', (done) => {
    const item = new Parse.Object('Foo^Bar');
    item.save().catch(() => {
      done();
    });
  });

  it('cannot create invalid key names', (done) => {
    const item = new Parse.Object('Item');
    assert(!item.set({ 'foo^bar': 'baz' }));
    item.save({ 'foo^bar': 'baz' }).catch((e) => {
      assert.equal(e.code, Parse.Error.INVALID_KEY_NAME);
      done();
    });
  });

  it('cannot use invalid key names in multiple sets', () => {
    const item = new Parse.Object('Item');
    assert(!item.set({
      'foobar': 'baz',
      'foo^bar': 'baz'
    }));
    assert(!item.get('foobar'));
  });

  it('can unset fields', (done) => {
    const simple = new Parse.Object('SimpleObject');
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

      const query = new Parse.Query('SimpleObject');
      return query.get(simple.id);
    }).then((s) => {
      assert(!s.has('foo'));
      done();
    });
  });

  it('can delete fields before the first save', (done) => {
    const simple = new Parse.Object('SimpleObject');
    simple.set('foo', 'bar');
    simple.unset('foo');

    assert(!simple.has('foo'));
    assert(simple.dirty('foo'));
    assert(simple.dirty());
    simple.save().then(() => {
      assert(!simple.has('foo'));
      assert(!simple.dirty('foo'));
      assert(!simple.dirty());

      const query = new Parse.Query('SimpleObject');
      return query.get(simple.id);
    }).then((s) => {
      assert(!s.has('foo'));
      done();
    });
  });

  it('can delete pointers', (done) => {
    const simple = new Parse.Object('SimpleObject');
    const child = new Parse.Object('Child');
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

      const query = new Parse.Query('SimpleObject');
      return query.get(simple.id);
    }).then((s) => {
      assert(!s.has('foo'));
      done();
    });
  });

  it('clears deleted keys', (done) => {
    const simple = new Parse.Object('SimpleObject');
    simple.set('foo', 'bar');
    simple.unset('foo');
    simple.save().then(() => {
      simple.set('foo', 'baz');
      return simple.save();
    }).then(() => {
      const query = new Parse.Query('SimpleObject');
      return query.get(simple.id);
    }).then((s) => {
      assert.equal(s.get('foo'), 'baz');
      done();
    });
  });

  it('can set keys after deleting them', (done) => {
    const simple = new Parse.Object('SimpleObject');
    simple.set('foo', 'bar')
    simple.save().then(() => {
      simple.unset('foo');
      simple.set('foo', 'baz');
      return simple.save();
    }).then(() => {
      const query = new Parse.Query('SimpleObject');
      return query.get(simple.id);
    }).then((s) => {
      assert.equal(s.get('foo'), 'baz');
      done();
    });
  });

  it('can increment fields', (done) => {
    const simple = new Parse.Object('SimpleObject');
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

      const query = new Parse.Query('SimpleObject');
      return query.get(simple.id);
    }).then((s) => {
      assert.equal(s.get('count'), 6);
      done();
    });
  });

  it('can set the object id', () => {
    const object = new TestObject();
    object.set('objectId', 'foo');
    assert.equal(object.id, 'foo');
    object.set('id', 'bar');
    assert.equal(object.id, 'bar');
  });

  it('can mark dirty attributes', (done) => {
    const object = new TestObject();
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
    const object = new TestObject();
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
    const object = new Parse.Object('TestObject');
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

      const Related = Parse.Object.extend('RelatedObject');
      const relatedObjects = [];
      for (let i = 0; i < 5; i++) {
        relatedObjects.push(new Related({ i: i }));
      }
      return Parse.Object.saveAll(relatedObjects).then(() => {
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

      }).then(done).catch(done.fail);
    }).catch(done.fail);
  });

  it('can repeatedly unset old attributes', (done) => {
    const obj = new TestObject();
    obj.set('x', 3);
    obj.save().then(() => {
      obj.unset('x');
      obj.unset('x');
      return obj.save();
    }).then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      const query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can repeatedly unset new attributes', (done) => {
    const obj = new TestObject();
    obj.set('x', 5);
    obj.unset('x');
    obj.unset('x');
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      const query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can repeatedly unset an unknown attributes', (done) => {
    const obj = new TestObject();
    obj.unset('x');
    obj.unset('x');
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      const query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can unset then clear old attributes', (done) => {
    const obj = new TestObject();
    obj.set('x', 3);
    obj.save().then(() => {
      obj.unset('x');
      obj.clear();
      return obj.save();
    }).then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      const query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can unset then clear new attributes', (done) => {
    const obj = new TestObject();
    obj.set('x', 5);
    obj.unset('x');
    obj.clear();
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      const query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can unset then clear unknown attributes', (done) => {
    const obj = new TestObject();
    obj.unset('x');
    obj.clear();
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      const query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can clear then unset old attributes', (done) => {
    const obj = new TestObject();
    obj.set('x', 3);
    obj.save().then(() => {
      obj.clear();
      obj.unset('x');
      return obj.save();
    }).then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      const query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can clear then unset new attributes', (done) => {
    const obj = new TestObject();
    obj.set('x', 5);
    obj.clear();
    obj.unset('x');
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      const query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can clear then unset unknown attributes', (done) => {
    const obj = new TestObject();
    obj.clear();
    obj.unset('x');
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      const query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can clear then clear old attributes', (done) => {
    const obj = new TestObject();
    obj.set('x', 3);
    obj.save().then(() => {
      obj.clear();
      obj.clear();
      return obj.save();
    }).then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      const query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can clear then clear new attributes', (done) => {
    const obj = new TestObject();
    obj.set('x', 5);
    obj.clear();
    obj.clear();
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      const query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can clear then clear unknown attributes', (done) => {
    const obj = new TestObject();
    obj.clear();
    obj.clear();
    obj.save().then(() => {
      assert.equal(obj.has('x'), false);
      assert.equal(obj.get('x'), undefined);
      const query = new Parse.Query(TestObject);
      return query.get(obj.id);
    }).then((o) => {
      assert.equal(o.has('x'), false);
      assert.equal(o.get('x'), undefined);
      done();
    });
  });

  it('can save children in an array', (done) => {
    const Parent = Parse.Object.extend('Parent');
    const Child = Parse.Object.extend('Child');

    const child1 = new Child();
    const child2 = new Child();
    const parent = new Parent();

    child1.set('name', 'jaime');
    child1.set('house', 'lannister');
    child2.set('name', 'cersei');
    child2.set('house', 'lannister');
    parent.set('children', [child1, child2]);

    parent.save().then(() => {
      const query = new Parse.Query(Child);
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

  it('can skip cascade saving as per request', async(done) => {
    const Parent = Parse.Object.extend('Parent');
    const Child = Parse.Object.extend('Child');

    const parent = new Parent();
    const child1 = new Child();
    const child2 = new Child();
    const child3 = new Child();

    child1.set('name', 'rob');
    child2.set('name', 'sansa');
    child3.set('name', 'john');
    parent.set('children', [child1, child2]);
    parent.set('bastard', child3);

    expect(parent.save).toThrow();
    let results = await new Parse.Query(Child).find();
    assert.equal(results.length, 0);

    await parent.save(null, { cascadeSave: true });
    results = await new Parse.Query(Child).find();
    assert.equal(results.length, 3);

    parent.set('dead', true);
    child1.set('dead', true);
    await parent.save(null);
    const rob = await new Parse.Query(Child).equalTo('name', 'rob').first();
    expect(rob.get('dead')).toBe(true);

    parent.set('lastname', 'stark');
    child3.set('lastname', 'stark');
    await parent.save(null, { cascadeSave: false });
    const john = await new Parse.Query(Child).doesNotExist('lastname').first();
    expect(john.get('lastname')).toBeUndefined();

    done();
  });

  it('can do two saves at the same time', (done) => {
    const object = new TestObject();
    let firstSave = true;

    const success = () => {
      if (firstSave) {
        firstSave = false;
        return;
      }

      const query = new Parse.Query('TestObject');
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
    const object = new TestObject();
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
    const object = new TestObject();
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
    const child = new Parse.Object('Person');
    const parent = new Parse.Object('Person');

    child.save().then(() => {
      parent.add('children', child);
      return parent.save();
    }).then(() => {
      const query = new Parse.Query('Person');
      return query.get(parent.id);
    }).then((p) => {
      assert.equal(p.get('children')[0].id, child.id);
      done();
    });
  });

  it('can add objects to an array in batch mode', (done) => {
    const child1 = new Parse.Object('Person');
    const child2 = new Parse.Object('Person');
    const parent = new Parse.Object('Person');

    Promise.all([child1.save(), child2.save()]).then((children) => {
      parent.addAll('children', children);
      return parent.save();
    }).then(() => {
      const query = new Parse.Query('Person');
      return query.get(parent.id);
    }).then((p) => {
      assert.equal(p.get('children')[0].id, child1.id);
      assert.equal(p.get('children')[1].id, child2.id);
      done();
    });
  });

  it('can convert saved objects to json', (done) => {
    const object = new TestObject();
    object.save({ foo: 'bar' }).then(() => {
      const json = object.toJSON();
      assert(json.foo);
      assert(json.objectId);
      assert(json.createdAt);
      assert(json.updatedAt);
      done();
    });
  });

  it('can convert unsaved objects to json', () => {
    const object = new TestObject();
    object.set({ foo: 'bar' });
    const json = object.toJSON();
    assert(json.foo);
    assert(!json.objectId);
    assert(!json.createdAt);
    assert(!json.updatedAt);
  });

  it('can remove objects from array fields', (done) => {
    const object = new TestObject();
    let container;
    object.save().then(() => {
      container = new TestObject();
      container.add('array', object);
      assert.equal(container.get('array').length, 1);
      return container.save();
    }).then(() => {
      const o = new TestObject();
      o.id = object.id;
      container.remove('array', o);
      assert.equal(container.get('array').length, 0);
      done();
    });
  });

  it('can remove objects from array fields in batch mode', (done) => {
    const obj1 = new TestObject();
    const obj2 = new TestObject();

    Promise.all([obj1.save(), obj2.save()]).then((objects) => {
      const container = new TestObject();
      container.addAll('array', objects);
      assert.equal(container.get('array').length, 2);
      return container.save();
    }).then((container) => {
      const o1 = new TestObject();
      o1.id = obj1.id;
      const o2 = new TestObject();
      o2.id = obj2.id;
      const o3 = new TestObject();
      o3.id = 'there_is_no_such_object'

      container.removeAll('array', [o1, o2, o3]);
      assert.equal(container.get('array').length, 0);
      done();
    });
  });

  it('can perform async methods', (done) => {
    const object = new TestObject();
    object.set('time', 'adventure');
    object.save().then(() => {
      assert(object.id);
      const again = new TestObject();
      again.id = object.id;
      return again.fetch();
    }).then((again) => {
      assert.equal(again.get('time'), 'adventure');
      return again.destroy();
    }).then(() => {
      const query = new Parse.Query(TestObject);
      query.equalTo('objectId', object.id);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 0);
      done();
    });
  });

  it('fails validation with a promise', (done) => {
    const PickyEater = Parse.Object.extend('PickyEater', {
      validate: function(attrs) {
        if (attrs.meal === 'tomatoes') {
          return 'Ew. Gross.';
        }
        return Parse.Object.prototype.validate.apply(this, arguments);
      }
    });

    const bryan = new PickyEater();
    bryan.save({ meal: 'burrito' }).then(() => {
      return bryan.save({ meal: 'tomatoes' });
    }).catch((e) => {
      assert.equal(e, 'Ew. Gross.');
      done();
    });
  });

  it('works with bytes type', (done) => {
    const object = new TestObject();
    object.set('bytes', { __type: 'Bytes', base64: 'ZnJveW8=' });
    object.save().then(() => {
      const query = new Parse.Query(TestObject);
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
    const objects = [new TestObject(), new TestObject()];
    Parse.Object.destroyAll(objects).then(() => {
      done();
    });
  });

  it('can destroyAll a single object', (done) => {
    const o = new TestObject();
    o.save().then(() => {
      return Parse.Object.destroyAll([o]);
    }).then(() => {
      const query = new Parse.Query(TestObject);
      return query.get(o.id);
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('can destroyAll two batches', (done) => {
    const objects = [];
    for (let i = 0; i < 21; i++) {
      objects[i] = new TestObject();
    }
    Parse.Object.saveAll(objects).then(() => {
      return Parse.Object.destroyAll(objects);
    }).then(() => {
      const query = new Parse.Query(TestObject);
      query.containedIn('objectId', [objects[0].id, objects[20].id]);
      return query.find();
    }).then((results) => {
      assert.equal(results.length, 0);
      done();
    });
  });

  it('can destroyAll an object that does not exist', (done) => {
    const o = new TestObject();
    o.id = 'fakeobject';
    Parse.Object.destroyAll([o]).catch((e) => {
      assert.equal(e.code, Parse.Error.AGGREGATE_ERROR);
      assert.equal(e.errors.length, 1);
      done();
    });
  });

  it('can destroyAll two batches when the first object does not exist', (done) => {
    const objects = [];
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
    const objects = [];
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
    const objects = [];
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
    const objects = [];
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
    const numItems = 11;
    const container = new Container();
    const items = [];
    for (let i = 0; i < numItems; i++) {
      const item = new Item();
      item.set('x', i);
      items.push(item);
    }
    Parse.Object.saveAll(items).then(() => {
      container.set('items', items);
      return container.save();
    }).then(() => {
      const query = new Parse.Query(Container);
      return query.get(container.id);
    }).then((containerAgain) => {
      const itemsAgain = containerAgain.get('items');
      assert.equal(itemsAgain.length, numItems);
      itemsAgain.forEach((item, i) => {
        const newValue = i * 2;
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
    const object = new TestObject();
    object.set('x', 7);
    object.save().then(() => {
      const query = new Parse.Query(TestObject);
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
    const container = new Container();
    container.set('item', new Item());
    container.set('subcontainer', new Container());
    return container.save().then(() => {
      const query = new Parse.Query(Container);
      return query.get(container.id);
    }).then((containerAgain) => {
      const subContainerAgain = containerAgain.get('subcontainer');
      const itemAgain = containerAgain.get('item');
      const multiClassArray = [subContainerAgain, itemAgain];
      return Parse.Object.fetchAll(multiClassArray);
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.INVALID_CLASS_NAME);
    });
  });

  it('fails fetchAll on unsaved object', () => {
    const unsavedObjectArray = [new TestObject()];
    return Parse.Object.fetchAll(unsavedObjectArray).catch((e) => {
      assert.equal(e.code, Parse.Error.MISSING_OBJECT_ID);
    });
  });

  it('fails fetchAll on deleted object', (done) => {
    const numItems = 11;
    const items = [];
    for (let i = 0; i < numItems; i++) {
      const item = new Item();
      item.set('x', i);
      items.push(item);
    }
    Parse.Object.saveAll(items).then(() => {
      const query = new Parse.Query(Item);
      return query.get(items[0].id);
    }).then((objectToDelete) => {
      return objectToDelete.destroy();
    }).then((deletedObject) => {
      const nonExistentObject = new Item({ objectId: deletedObject.id });
      const nonExistentObjectArray = [nonExistentObject, items[1]];
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
      const query = new Parse.Query(Parse.User);
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

  it('can fetchAllIfNeededWithInclude', async () => {
    const pointer = new TestObject({ foo: 'bar' });
    const item1 = new Item({ x: 1});
    const item2 = new Item({ x: 2, pointer });
    const items = [item1, item2];

    await Parse.Object.saveAll(items);

    const container = new Container();
    container.set('items', items);
    await container.save();

    const query = new Parse.Query(Container);
    const containerAgain = await query.get(container.id);

    // Fetch objects with no data
    const itemsAgain = containerAgain.get('items');
    const item1Again = itemsAgain[0].set('x', 100);
    const item2Again = itemsAgain[1];

    // Override item1 in database, this shouldn't fetch
    await item1Again.save();

    const fetchedItems = await Parse.Object.fetchAllIfNeededWithInclude([item1, item2Again], ['pointer']);
    assert.equal(fetchedItems.length, items.length);
    assert.equal(fetchedItems[0].get('x'), 1);
    assert.equal(fetchedItems[1].get('x'), 2); // item2Again should update
    assert.equal(fetchedItems[1].get('pointer').id, pointer.id);
    assert.equal(fetchedItems[1].get('pointer').get('foo'), 'bar');
  });

  it('can fetchAllIfNeeded', (done) => {
    const numItems = 11;
    const container = new Container();
    const items = [];
    for (let i = 0; i < numItems; i++) {
      const item = new Item();
      item.set('x', i);
      items.push(item);
    }
    Parse.Object.saveAll(items).then(() => {
      container.set('items', items);
      return container.save();
    }).then(() => {
      const query = new Parse.Query(Container);
      return query.get(container.id);
    }).then((containerAgain) => {
      const itemsAgain = containerAgain.get('items');
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

  it('can fetchAllIfNeeded with an unsaved object', (done) => {
    const unsavedObjectArray = [new TestObject()];
    Parse.Object.fetchAllIfNeeded(unsavedObjectArray).catch((e) => {
      assert.equal(e.code, Parse.Error.MISSING_OBJECT_ID);
      done();
    });
  });

  it('fails fetchAllIfNeeded on multiple classes', () => {
    const container = new Container();
    container.set('item', new Item());
    container.set('subcontainer', new Container());
    return container.save().then(() => {
      const query = new Parse.Query(Container);
      return query.get(container.id);
    }).then((containerAgain) => {
      const subContainerAgain = containerAgain.get('subcontainer');
      const itemAgain = containerAgain.get('item');
      const multiClassArray = [subContainerAgain, itemAgain];
      return Parse.Object.fetchAllIfNeeded(multiClassArray);
    }).catch((e) => {
      assert.equal(e.code, Parse.Error.INVALID_CLASS_NAME);
    });
  });

  it('can rewrite the User classname', (done) => {
    assert.equal(Parse.CoreManager.get('PERFORM_USER_REWRITE'), true);
    const User1 = Parse.Object.extend({
      className: 'User'
    });

    assert.equal(User1.className, '_User');

    Parse.User.allowCustomUserClass(true);
    assert.equal(Parse.CoreManager.get('PERFORM_USER_REWRITE'), false);
    const User2 = Parse.Object.extend({
      className: 'User'
    });

    assert.equal(User2.className, 'User');

    Parse.User.allowCustomUserClass(false);
    assert.equal(Parse.CoreManager.get('PERFORM_USER_REWRITE'), true);

    const user = new User2();
    user.set('name', 'Me');
    user.save({ height: 181 }).then(() => {
      assert.equal(user.get('name'), 'Me');
      assert.equal(user.get('height'), 181);

      const query = new Parse.Query(User2);
      return query.get(user.id);
    }).then(() => {
      assert.equal(user.className, 'User');
      assert.equal(user.get('name'), 'Me');
      assert.equal(user.get('height'), 181);

      done();
    });
  });

  it('can create objects without data', (done) => {
    const t1 = new TestObject({ test: 'test' });
    t1.save().then(() => {
      const t2 = TestObject.createWithoutData(t1.id);
      return t2.fetch();
    }).then((t2) => {
      assert.equal(t2.get('test'), 'test');
      const t3 = TestObject.createWithoutData(t2.id);
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
    const LimitedObject = Parse.Object.extend('LimitedObject');
    LimitedObject.readOnlyAttributes = function() {
      return ['immutable'];
    };

    const lo = new LimitedObject();
    try {
      lo.set('immutable', 'mutable');
    } catch (e) {
      done();
    }
  });

  it('fires errors when readonly attributes are unset', (done) => {
    const LimitedObject = Parse.Object.extend('LimitedObject');
    LimitedObject.readOnlyAttributes = function() {
      return ['immutable'];
    };

    const lo = new LimitedObject();
    try {
      lo.unset('immutable');
    } catch (e) {
      done();
    }
  });

  it('can clone with relation', async (done) => {
    const testObject = new TestObject();
    const o = new TestObject();
    await o.save();
    await testObject.save();
    let relation = o.relation('aRelation');
    relation.add(testObject);
    await o.save();

    const o2 = o.clone();
    assert.equal(
      o.relation('aRelation').targetClassName,
      o2.relation('aRelation').targetClassName
    );
    let relations = await o.relation('aRelation').query().find();
    assert.equal(relations.length, 1);

    relations = await o2.relation('aRelation').query().find();
    assert.equal(relations.length, 0);

    relation = o2.relation('aRelation');
    relation.add(testObject);
    await o2.save();

    relations = await o.relation('aRelation').query().find();
    assert.equal(relations.length, 1);

    relations = await o2.relation('aRelation').query().find();
    assert.equal(relations.length, 1);

    done();
  });

  it('isDataAvailable', async () => {
    const child = new TestObject({ foo: 'bar' });
    assert.equal(child.isDataAvailable(), false);

    const parent = new TestObject({ child });
    await parent.save();

    assert.equal(child.isDataAvailable(), true);
    assert.equal(parent.isDataAvailable(), true);

    const query = new Parse.Query(TestObject);
    const fetched = await query.get(parent.id);
    const unfetched = fetched.get('child');

    assert.equal(fetched.isDataAvailable(), true);
    assert.equal(unfetched.isDataAvailable(), false);
  });

  it('isDataAvailable user', async () => {
    let user = new Parse.User();
    user.set('username', 'plain');
    user.set('password', 'plain');
    await user.signUp();
    assert.equal(user.isDataAvailable(), true);

    user = await Parse.User.logIn('plain', 'plain');
    assert.equal(user.isDataAvailable(), true);

    const query = new Parse.Query(Parse.User);
    const fetched = await query.get(user.id);
    assert.equal(fetched.isDataAvailable(), true);
  });
});
