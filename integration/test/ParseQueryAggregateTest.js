'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');

describe('Parse Aggregate Query', () => {
  beforeEach((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => {
      const obj1 = new TestObject({score: 10, name: 'foo'});
      const obj2 = new TestObject({score: 10, name: 'foo'});
      const obj3 = new TestObject({score: 10, name: 'bar'});
      const obj4 = new TestObject({score: 20, name: 'dpl'});
      return Parse.Object.saveAll([obj1, obj2, obj3, obj4]);
    }).then(() => {
      return Parse.User.logOut();
    })
      .then(() => { done() }, () => { done() });
  });

  it('aggregate pipeline object query', (done) => {
    const pipeline = {
      group: { objectId: '$name' },
    };
    const query = new Parse.Query(TestObject);
    query.aggregate(pipeline).then((results) => {
      assert.equal(results.length, 3);
      done();
    });
  });

  it('aggregate pipeline array query', (done) => {
    const pipeline = [
      { group: { objectId: '$name' } }
    ];
    const query = new Parse.Query(TestObject);
    query.aggregate(pipeline).then((results) => {
      assert.equal(results.length, 3);
      done();
    });
  });

  it('aggregate pipeline invalid query', (done) => {
    const pipeline = 1234;
    const query = new Parse.Query(TestObject);
    try {
      query.aggregate(pipeline).then(() => {});
    } catch (e) {
      done();
    }
  });

  it('aggregate allow multiple of same stage', async () => {
    const pointer1 = new TestObject({ value: 1 });
    const pointer2 = new TestObject({ value: 2 });
    const pointer3 = new TestObject({ value: 3 });

    const obj1 = new TestObject({ pointer: pointer1, name: 'Hello' });
    const obj2 = new TestObject({ pointer: pointer2, name: 'Hello' });
    const obj3 = new TestObject({ pointer: pointer3, name: 'World' });

    const pipeline = [{
      match: { name: 'Hello' },
    }, {
      // Transform className$objectId to objectId and store in new field tempPointer
      project: {
        tempPointer: { $substr: ['$_p_pointer', 11, -1] }, // Remove TestObject$
      },
    }, {
      // Left Join, replace objectId stored in tempPointer with an actual object
      lookup: {
        from: 'TestObject',
        localField: 'tempPointer',
        foreignField: '_id',
        as: 'tempPointer',
      },
    }, {
      // lookup returns an array, Deconstructs an array field to objects
      unwind: {
        path: '$tempPointer',
      },
    }, {
      match: { 'tempPointer.value': 2 },
    }];
    await Parse.Object.saveAll([pointer1, pointer2, pointer3, obj1, obj2, obj3]);

    const query = new Parse.Query(TestObject);
    const results = await query.aggregate(pipeline);

    expect(results.length).toEqual(1);
    expect(results[0].tempPointer.value).toEqual(2);
  });

  it('aggregate pipeline on top of a simple query', async done => {
    const pipeline = {
      group: { objectId: '$name' },
    };
    let results = await new Parse.Query(TestObject)
      .equalTo('name', 'foo')
      .aggregate(pipeline);

    expect(results.length).toBe(1);

    results = await new Parse.Query(TestObject)
      .equalTo('score', 20)
      .aggregate(pipeline);

    expect(results.length).toBe(1);

    done();
  });

  it('distinct query', () => {
    const query = new Parse.Query(TestObject);
    return query.distinct('score').then((results) => {
      assert.equal(results.length, 2);
      // Order the results in case
      const orderedResults = results.sort((a, b) => a - b);
      assert.equal(orderedResults[0], 10);
      assert.equal(orderedResults[1], 20);
    });
  });

  it('distinct equalTo query', (done) => {
    const query = new Parse.Query(TestObject);
    query.equalTo('name', 'foo')
    query.distinct('score').then((results) => {
      assert.equal(results.length, 1);
      assert.equal(results[0], 10);
      done();
    });
  });
});
