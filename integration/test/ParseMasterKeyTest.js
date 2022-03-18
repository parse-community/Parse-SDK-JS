'use strict';

const assert = require('assert');
const Parse = require('../../node');

describe('Master Key', () => {
  it('can perform a simple save', done => {
    const object = new TestObject();
    object.set('color', 'purple');
    object.save(null, { useMasterKey: true }).then(() => {
      assert(object.id);
      done();
    });
  });

  it('can perform a save without permissions', async () => {
    const user = await Parse.User.signUp('andrew', 'password');
    const object = new TestObject({ ACL: new Parse.ACL(user) });
    await object.save();

    await Parse.User.logOut();
    await object.save(null, { useMasterKey: true });
  });

  it('throws when no master key is provided', done => {
    Parse.CoreManager.set('MASTER_KEY', null);
    const object = new TestObject();
    object.save(null, { useMasterKey: true }).catch(() => {
      // should fail
      Parse.CoreManager.set('MASTER_KEY', 'notsosecret');
      done();
    });
  });
});
