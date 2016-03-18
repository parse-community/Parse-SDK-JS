'use strict';

const assert = require('assert');
const clear = require('./clear');
const mocha = require('mocha');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');
const Parent = Parse.Object.extend('Parent');
const Child = Parse.Object.extend('Child');

describe('Dirty Objects', () => {
  before((done) => {
    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => {
      done();
    });
  });

  it('tracks dirty arrays', (done) => {
    let array = [1];
    let object = new TestObject();
    object.set('scores', array);
    assert.equal(object.get('scores').length, 1);
    object.save().then(() => {
      array.push(2);
      assert.equal(object.get('scores').length, 2);
      return object.save();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('scores').length, 2);
      done();
    });
  });

  it('tracks dirty arrays after fetch', (done) => {
    let object = new TestObject();
    object.set('scores', [1]);
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      let array = o.get('scores');
      array.push(2);
      return o.save();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('scores').length, 2);
      done();
    });
  });

  it('tracks dirty objects', (done) => {
    let dict = {player1: 1};
    let object = new TestObject();
    object.set('scoreMap', dict);
    object.save().then(() => {
      dict.player2 = 2;
      return object.save();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(Object.keys(o.get('scoreMap')).length, 2);
      done();
    });
  });

  it('tracks dirty objects after fetch', (done) => {
    let dict = {player1: 1};
    let object = new TestObject();
    object.set('scoreMap', dict);
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      let dictAgain = o.get('scoreMap');
      dictAgain.player2 = 2;
      return o.save();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(Object.keys(o.get('scoreMap')).length, 2);
      done();
    });
  });

  it('tracks dirty geo points', (done) => {
    let geo = new Parse.GeoPoint(5, 5);
    let object = new TestObject();
    object.set('location', geo);
    object.save().then(() => {
      geo.latitude = 10;
      return object.save();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('location').latitude, 10);
      done();
    });
  });

  it('tracks dirty geo points on fresh objects', (done) => {
    let geo = new Parse.GeoPoint(1.0, 1.0);
    let object = new TestObject();
    object.set('location', geo);
    geo.latitude = 2.0;
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('location').latitude, 2);
      done();
    });
  });

  it('does not resave relations with dirty children', () => {
    let parent = new Parent();
    let child = new Child();
    let newChild;
    let parentAgain;
    child.set('ghostbuster', 'peter');
    parent.set('child', child);
    parent.save().then(() => {
      assert.equal(parent.get('child'), child);
      assert.equal(child.get('ghostbuster'), 'peter');

      let query = new Parse.Query(Parent);
      return query.get(parent.id);
    }).then((again) => {
      parentAgain = again;
      newChild = new Child();
      newChild.set('ghostbuster', 'ray');
      parentAgain.set('child', newChild);
      return parentAgain.save();
    }).then(() => {
      assert.equal(parent.get('child'), child);
      assert.equal(parentAgain.get('child'), newChild);
      assert.equal(child.get('ghostbuster'), 'peter');
      assert.equal(newChild.get('ghostbuster'), 'ray');

      // Now parent's child is newChild.  If we change the original
      // child, it shouldn't affect parent.
      child.set('ghostbuster', 'egon');
      assert.equal(parent.get('child').get('ghostbuster'), 'egon');

      return parent.save();
    }).then(()=> {
      assert.equal(parent.get('child'), child);
      assert.equal(parentAgain.get('child'), newChild);
      assert.equal(child.get('ghostbuster'), 'egon');
      assert.equal(newChild.get('ghostbuster'), 'ray');

      let query = new Parse.Query(Parent);
      return query.get(parent.id);
    }).then((yetAgain) => {
      assert.equal(parent.get('child'), child);
      assert.equal(parentAgain.get('child'), newChild);
      assert.equal(yetAgain.get('child').id, newChild.id);
      assert.equal(child.get('ghostbuster'), 'egon');
      assert.equal(newChild.get('ghostbuster'), 'ray');

      let newChildAgain = yetAgain.get('child');
      assert.equal(newChildAgain.id, newChild.id);
      return newChildAgain.fetch();
    }).then((c) => {
      assert.equal(c.get('ghostbuster'), 'ray');
      done();
    });
  });

  it('does not dirty two-way pointers on saveAll', (done) => {
    let parent = new Parent();
    let child = new Child();

    child.save().then(() => {
      child.set('property', 'x');
      parent.set('children', [child]);
      child.set('parent', parent);
      return Parse.Object.saveAll([parent, child]);
    }).then((results) => {
      assert.equal(results[0].dirty(), false);
      assert.equal(results[1].dirty(), false);
      done();
    });
  });

  it('unset fields should not stay dirty', (done) => {
    let object = new TestObject();
    object.save({ foo: 'bar' }).then(() => {
      assert.equal(object.dirty(), false);
      object.unset('foo');
      assert.equal(object.dirty(), true);

      return object.save();
    }).then(() => {
      assert.equal(object.dirty(), false);
      done();
    });
  });
});
