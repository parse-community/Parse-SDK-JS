'use strict';

const assert = require('assert');
const clear = require('./clear');
const mocha = require('mocha');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');

describe('Master Key', () => {
  before((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => {
      done();
    });
  });

  it('can perform a simple save', (done) => {
    let object = new TestObject();
    object.set('color', 'purple');
    object.save(null, { useMasterKey: true }).then((obj) => {
      assert(object.id);
      done();
    });
  });

  it('can perform a save without permissions', (done) => {
    let object;
    Parse.User.signUp('andrew', 'password').then((user) => {
      object = new TestObject({ ACL: new Parse.ACL(user) });
      return object.save();
    }).then(() => {
      Parse.User.logOut();
      return object.save(null, { useMasterKey: true });
    }).then(() => {
      // expect success
      done();
    }).fail((e) => console.log(e));
  });

  it('throws when no master key is provided', (done) => {
    Parse.CoreManager.set('MASTER_KEY', null);
    let object = new TestObject();
    object.save(null, { useMasterKey: true }).fail(() => {
      // should fail
      done();
    });
  });
});