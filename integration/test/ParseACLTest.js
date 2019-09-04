'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');

describe('Parse.ACL', () => {
  beforeEach((done) => {
    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    Parse.User.enableUnsafeCurrentUser();
    clear().then(() => {
      Parse.User.logOut().then(() => { done() }, () => { done() });
    }).catch(done.fail);
  });

  it('acl must be valid', () => {
    const user = new Parse.User();
    assert.equal(user.setACL(`Ceci n'est pas un ACL.`), false);
  });

  it('can refresh object with acl', async () => {
    const user = new Parse.User();
    const object = new TestObject();
    user.set('username', 'alice');
    user.set('password', 'wonderland');
    await user.signUp();
    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    const o = await object.fetch();
    assert(o);
  });

  it('disables public get access', async () => {
    const user = new Parse.User();
    const object = new TestObject();
    user.set('username', 'getter');
    user.set('password', 'secret');
    await user.signUp();

    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    assert.equal(object.getACL().getReadAccess(user), true);
    assert.equal(object.getACL().getWriteAccess(user), true);
    assert.equal(object.getACL().getPublicReadAccess(), false);
    assert.equal(object.getACL().getPublicWriteAccess(), false);

    await await Parse.User.logOut();
    try {
      const query = new Parse.Query(TestObject);
      await query.get(object.id);
    } catch (e) {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
    }
  });

  it('disables public find access', async () => {
    const user = new Parse.User();
    const object = new Parse.Object('UniqueObject');
    user.set('username', 'finder');
    user.set('password', 'secret');
    await user.signUp();

    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    assert.equal(object.getACL().getReadAccess(user), true);
    assert.equal(object.getACL().getWriteAccess(user), true);
    assert.equal(object.getACL().getPublicReadAccess(), false);
    assert.equal(object.getACL().getPublicWriteAccess(), false);

    await Parse.User.logOut();
    const query = new Parse.Query('UniqueObject');
    const o = await query.find();
    assert.equal(o.length, 0);
  });

  it('disables public update access', async () => {
    const user = new Parse.User();
    const object = new Parse.Object('UniqueObject');
    user.set('username', 'updater');
    user.set('password', 'secret');
    await user.signUp();

    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    assert.equal(object.getACL().getReadAccess(user), true);
    assert.equal(object.getACL().getWriteAccess(user), true);
    assert.equal(object.getACL().getPublicReadAccess(), false);
    assert.equal(object.getACL().getPublicWriteAccess(), false);

    await Parse.User.logOut();

    object.set('score', 10);
    try {
      await object.save();
    } catch (e) {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
    }
  });

  it('disables public delete access', async () => {
    const user = new Parse.User();
    const object = new Parse.Object(TestObject);
    user.set('username', 'deleter');
    user.set('password', 'secret');
    await user.signUp();

    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    assert.equal(object.getACL().getReadAccess(user), true);
    assert.equal(object.getACL().getWriteAccess(user), true);
    assert.equal(object.getACL().getPublicReadAccess(), false);
    assert.equal(object.getACL().getPublicWriteAccess(), false);

    await Parse.User.logOut();

    try {
      await object.destroy();
    } catch (e) {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
    }
  });

  it('allows logged in get', async () => {
    const user = new Parse.User();
    const object = new TestObject();
    user.set('username', 'getter2');
    user.set('password', 'secret');
    await user.signUp();

    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    const o = await new Parse.Query(TestObject).get(object.id);
    assert(o);
  });

  it('allows logged in find', async () => {
    const user = new Parse.User();
    const object = new Parse.Object('UniqueObject');
    user.set('username', 'finder2');
    user.set('password', 'secret');
    await user.signUp();

    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    const o = await new Parse.Query('UniqueObject').find();
    assert(o.length > 0);
  });

  it('allows logged in update', async () => {
    const user = new Parse.User();
    const object = new Parse.Object('UniqueObject');
    user.set('username', 'updater2');
    user.set('password', 'secret');
    await user.signUp();
    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();
    object.set('score', 10);
    await object.save();
    assert.equal(object.get('score'), 10);
  });

  it('allows logged in delete', async () => {
    const user = new Parse.User();
    const object = new Parse.Object(TestObject);
    user.set('username', 'deleter2');
    user.set('password', 'secret');
    await user.signUp();

    const acl = new Parse.ACL(user);
    object.setACL(acl);

    await object.save();
    await object.destroy();
  });

  it('enables get with public read', async () => {
    const user = new Parse.User();
    const object = new TestObject();
    user.set('username', 'getter3');
    user.set('password', 'secret');
    await user.signUp();
    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    object.getACL().setPublicReadAccess(true);
    await object.save();

    Parse.User.logOut();
    const o = await new Parse.Query(TestObject).get(object.id);
    assert(o);
  });

  it('enables find with public read', async () => {
    const user = new Parse.User();
    const object = new Parse.Object('AlsoUniqueObject');
    user.set('username', 'finder3');
    user.set('password', 'secret');
    await user.signUp();
    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    object.getACL().setPublicReadAccess(true);
    await object.save();

    Parse.User.logOut();
    const o = await new Parse.Query('AlsoUniqueObject').find();

    assert(o.length > 0);
  });

  it('does not enable update with public read', async () => {
    const user = new Parse.User();
    const object = new Parse.Object('UniqueObject');
    user.set('username', 'updater3');
    user.set('password', 'secret');
    await user.signUp();
    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    object.getACL().setPublicReadAccess(true);
    await object.save();

    Parse.User.logOut();
    object.set('score', 10);
    try {
      await object.save();
    } catch (e) {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
    }
  });

  it('does not enable delete with public read', async () => {
    const user = new Parse.User();
    const object = new Parse.Object(TestObject);
    user.set('username', 'deleter3');
    user.set('password', 'secret');
    await user.signUp();
    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    object.getACL().setPublicReadAccess(true);
    await object.save();

    Parse.User.logOut();
    try {
      await object.destroy();
    } catch (e) {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
    }
  });

  it('does not enable get with public write', async () => {
    const user = new Parse.User();
    const object = new TestObject();
    user.set('username', 'getter4');
    user.set('password', 'secret');
    await user.signUp();
    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    object.getACL().setPublicWriteAccess(true);
    await object.save();

    await Parse.User.logOut();
    try {
      await new Parse.Query(TestObject).get(object.id);
    } catch (e) {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
    }
  });

  it('does not enable find with public write', async () => {
    const user = new Parse.User();
    const object = new Parse.Object('AnotherUniqueObject');
    user.set('username', 'finder4');
    user.set('password', 'secret');
    await user.signUp();
    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    object.getACL().setPublicWriteAccess(true);
    await object.save();

    await Parse.User.logOut();
    const o = await new Parse.Query('AnotherUniqueObject').find();
    assert.equal(o.length, 0);
  });

  it('enables update with public read', async () => {
    const user = new Parse.User();
    const object = new Parse.Object('UniqueObject');
    user.set('username', 'updater4');
    user.set('password', 'secret');
    await user.signUp();
    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    object.getACL().setPublicWriteAccess(true);
    await object.save();

    await Parse.User.logOut();
    object.set('score', 10);
    await object.save();
  });

  it('enables delete with public read', async () => {
    const user = new Parse.User();
    const object = new TestObject();
    user.set('username', 'deleter4');
    user.set('password', 'secret');
    await user.signUp();
    const acl = new Parse.ACL(user);
    object.setACL(acl);
    await object.save();

    object.getACL().setPublicWriteAccess(true);
    await object.save();

    await Parse.User.logOut();
    await object.destroy();
  });

  it('can grant get access to another user', async () => {
    const object = new TestObject();
    const user1 = await Parse.User.signUp('aaa', 'password');
    await Parse.User.logOut();

    const user2 = await Parse.User.signUp('bbb', 'password');

    const acl = new Parse.ACL(user2);
    acl.setWriteAccess(user1, true);
    acl.setReadAccess(user1, true);
    object.setACL(acl);
    await object.save();

    await Parse.User.logIn('aaa', 'password');

    const query = new Parse.Query(TestObject);
    const o = await query.get(object.id);
    assert.equal(o.id, object.id);
  });

  it('can grant find access to another user', async () => {
    const object = new Parse.Object('ThatOneObject');
    const user1 = await Parse.User.signUp('ccc', 'password');
    await Parse.User.logOut();

    const user2 = await Parse.User.signUp('ddd', 'password');

    const acl = new Parse.ACL(user2);
    acl.setWriteAccess(user1, true);
    acl.setReadAccess(user1, true);
    object.setACL(acl);
    await object.save();

    await Parse.User.logIn('ccc', 'password');

    const query = new Parse.Query('ThatOneObject');
    const o = await query.find();
    assert(o.length > 0);
  });

  it('can grant update access to another user', async () => {
    const object = new TestObject();
    const user1 = await Parse.User.signUp('eee', 'password');

    await Parse.User.logOut();

    const user2 = await Parse.User.signUp('fff', 'password');

    const acl = new Parse.ACL(user2);
    acl.setWriteAccess(user1, true);
    acl.setReadAccess(user1, true);
    object.setACL(acl);
    await object.save();

    await Parse.User.logIn('eee', 'password');

    object.set('score', 10);
    const o = await object.save();
    assert.equal(o.get('score'), 10);
  });

  it('can grant delete access to another user', async () => {
    const object = new TestObject();
    const user1 = await Parse.User.signUp('ggg', 'password')
    await Parse.User.logOut();

    const user2 = await Parse.User.signUp('hhh', 'password');

    const acl = new Parse.ACL(user2);
    acl.setWriteAccess(user1, true);
    acl.setReadAccess(user1, true);
    object.setACL(acl);
    await object.save();

    await Parse.User.logIn('ggg', 'password');
    await object.destroy();
  });

  it('does not grant public get access with another user acl', async () => {
    const object = new TestObject();
    const user1 = await Parse.User.signUp('iii', 'password');
    await Parse.User.logOut();

    const user2 = await Parse.User.signUp('jjj', 'password');

    const acl = new Parse.ACL(user2);
    acl.setWriteAccess(user1, true);
    acl.setReadAccess(user1, true);
    object.setACL(acl);
    await object.save();

    await Parse.User.logOut();

    try {
      const query = new Parse.Query(TestObject);
      await query.get(object.id);
    } catch (e) {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
    }
  });

  it('does not grant public find access with another user acl', async () => {
    const object = new Parse.Object('ThatOneObject');
    const user1 = await Parse.User.signUp('kkk', 'password');
    await Parse.User.logOut();

    const user2 = await Parse.User.signUp('lll', 'password');

    const acl = new Parse.ACL(user2);
    acl.setWriteAccess(user1, true);
    acl.setReadAccess(user1, true);
    object.setACL(acl);
    await object.save();

    await Parse.User.logOut();

    const query = new Parse.Query('ThatOneObject');
    const o = await query.find();

    assert.equal(o.length, 0);
  });

  it('does not grant public update access with another user acl', async () => {
    const object = new TestObject();
    const user1 = await Parse.User.signUp('mmm', 'password');

    await Parse.User.logOut();

    const user2 = await Parse.User.signUp('nnn', 'password');
    const acl = new Parse.ACL(user2);
    acl.setWriteAccess(user1, true);
    acl.setReadAccess(user1, true);
    object.setACL(acl);
    await object.save();

    await Parse.User.logOut();

    object.set('score', 10);
    try {
      await object.save();
    } catch (e) {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
    }
  });

  it('does not grant public destroy access with another user acl', async () => {
    const object = new TestObject();
    const user1 = await Parse.User.signUp('ooo', 'password');

    await Parse.User.logOut();

    const user2 = await Parse.User.signUp('ppp', 'password');

    const acl = new Parse.ACL(user2);
    acl.setWriteAccess(user1, true);
    acl.setReadAccess(user1, true);
    object.setACL(acl);
    await object.save();

    await Parse.User.logOut();

    try {
      await object.destroy();
    } catch (e) {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
    }
  });

  it('allows access with an empty acl', async () => {
    await Parse.User.signUp('tdurden', 'mayhem', {
      ACL: new Parse.ACL(),
      foo: 'bar'
    });
    await Parse.User.logOut();
    const user = await Parse.User.logIn('tdurden', 'mayhem');
    assert.equal(user.get('foo'), 'bar');
  });

  it('fetches the ACL with included pointers', async () => {
    const obj1 = new Parse.Object('TestClass1');
    const obj2 = new Parse.Object('TestClass2');
    const acl = new Parse.ACL();

    acl.setPublicReadAccess(true);
    obj2.set('ACL', acl);
    obj1.set('other', obj2);
    await obj1.save();
    let query = new Parse.Query('TestClass1');
    const obj1again = await query.first();
    assert(obj1again);
    assert(!obj1again.get('other').get('ACL'));
    query = new Parse.Query('TestClass1');
    query.include('other');
    const obj1withInclude = await query.first();
    assert(obj1withInclude.get('other').get('ACL'));
  });
});
