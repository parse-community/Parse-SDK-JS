'use strict';

const assert = require('assert');
const clear = require('./clear');
const mocha = require('mocha');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');

describe('Parse Aggregate Query', () => {
  before((done) => {
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
      group: { objectId: '$name' }
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

  it('distinct query', (done) => {
    const query = new Parse.Query(TestObject);
    query.distinct('score').then((results) => {
      assert.equal(results.length, 2);
      assert.equal(results[0], 10);
      assert.equal(results[1], 20);
      done();
    }).catch(done.fail);
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
