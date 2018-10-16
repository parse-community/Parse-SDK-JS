'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');

describe('Master Key', () => {
  beforeEach((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => {
      done();
    });
  });

  it('can perform a simple save', (done) => {
    const object = new TestObject();
    object.set('color', 'purple');
    object.save(null, { useMasterKey: true }).then(() => {
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
    }).catch((e) => console.log(e));
  });

  it('throws when no master key is provided', (done) => {
    Parse.CoreManager.set('MASTER_KEY', null);
    const object = new TestObject();
    object.save(null, { useMasterKey: true }).catch(() => {
      // should fail
      done();
    });
  });
});
