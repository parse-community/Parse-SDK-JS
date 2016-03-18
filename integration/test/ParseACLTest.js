'use strict';

const assert = require('assert');
const clear = require('./clear');
const mocha = require('mocha');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');

describe('Parse.ACL', () => {
  before((done) => {
    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    Parse.User.enableUnsafeCurrentUser();
    clear().then(() => {
      done();
    });
  });

  it('acl must be valid', () => {
    let user = new Parse.User();
    assert.equal(user.setACL(`Ceci n'est pas un ACL.`), false);
  });

  it('can refresh object with acl', (done) => {
    let user = new Parse.User();
    let object = new TestObject();
    user.set('username', 'alice');
    user.set('password', 'wonderland');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then((x) => {
      return object.fetch();
    }).then((o) => {
      assert(o);
      done();
    });
  });

  it('disables public get access', (done) => {
    let user = new Parse.User();
    let object = new TestObject();
    user.set('username', 'getter');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      assert.equal(object.getACL().getReadAccess(user), true);
      assert.equal(object.getACL().getWriteAccess(user), true);
      assert.equal(object.getACL().getPublicReadAccess(), false);
      assert.equal(object.getACL().getPublicWriteAccess(), false);

      Parse.User.logOut();

      return new Parse.Query(TestObject).get(object.id);
    }).fail((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('disables public find access', (done) => {
    let user = new Parse.User();
    let object = new Parse.Object('UniqueObject');
    user.set('username', 'finder');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      assert.equal(object.getACL().getReadAccess(user), true);
      assert.equal(object.getACL().getWriteAccess(user), true);
      assert.equal(object.getACL().getPublicReadAccess(), false);
      assert.equal(object.getACL().getPublicWriteAccess(), false);

      Parse.User.logOut();

      return new Parse.Query('UniqueObject').find();
    }).then((o) => {
      assert.equal(o.length, 0);
      done();
    });
  });

  it('disables public update access', (done) => {
    let user = new Parse.User();
    let object = new Parse.Object('UniqueObject');
    user.set('username', 'updater');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      assert.equal(object.getACL().getReadAccess(user), true);
      assert.equal(object.getACL().getWriteAccess(user), true);
      assert.equal(object.getACL().getPublicReadAccess(), false);
      assert.equal(object.getACL().getPublicWriteAccess(), false);

      Parse.User.logOut();

      object.set('score', 10);
      return object.save();
    }).fail((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('disables public delete access', (done) => {
    let user = new Parse.User();
    let object = new Parse.Object(TestObject);
    user.set('username', 'deleter');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      assert.equal(object.getACL().getReadAccess(user), true);
      assert.equal(object.getACL().getWriteAccess(user), true);
      assert.equal(object.getACL().getPublicReadAccess(), false);
      assert.equal(object.getACL().getPublicWriteAccess(), false);

      Parse.User.logOut();

      return object.destroy();
    }).fail((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('allows logged in get', (done) => {
    let user = new Parse.User();
    let object = new TestObject();
    user.set('username', 'getter2');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      return new Parse.Query(TestObject).get(object.id);
    }).then((o) => {
      assert(o);
      done();
    });
  });

  it('allows logged in find', (done) => {
    let user = new Parse.User();
    let object = new Parse.Object('UniqueObject');
    user.set('username', 'finder2');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      return new Parse.Query('UniqueObject').find();
    }).then((o) => {
      assert(o.length > 0);
      done();
    });
  });

  it('allows logged in update', (done) => {
    let user = new Parse.User();
    let object = new Parse.Object('UniqueObject');
    user.set('username', 'updater2');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      object.set('score', 10);
      return object.save();
    }).then(() => {
      assert.equal(object.get('score'), 10);
      done();
    });
  });

  it('allows logged in delete', (done) => {
    let user = new Parse.User();
    let object = new Parse.Object(TestObject);
    user.set('username', 'deleter2');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      return object.destroy();
    }).then(() => {
      done();
    });
  });

  it('enables get with public read', (done) => {
    let user = new Parse.User();
    let object = new TestObject();
    user.set('username', 'getter3');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      object.getACL().setPublicReadAccess(true);
      return object.save();
    }).then(() => {
      Parse.User.logOut();
      return new Parse.Query(TestObject).get(object.id);
    }).then((o) => {
      assert(o);
      done();
    });
  });

  it('enables find with public read', (done) => {
    let user = new Parse.User();
    let object = new Parse.Object('AlsoUniqueObject');
    user.set('username', 'finder3');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      object.getACL().setPublicReadAccess(true);
      return object.save();
    }).then(() => {
      Parse.User.logOut();
      return new Parse.Query('AlsoUniqueObject').find();
    }).then((o) => {
      assert(o.length > 0);
      done();
    });
  });

  it('does not enable update with public read', (done) => {
    let user = new Parse.User();
    let object = new Parse.Object('UniqueObject');
    user.set('username', 'updater3');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      object.getACL().setPublicReadAccess(true);
      return object.save();
    }).then(() => {
      Parse.User.logOut();
      object.set('score', 10);
      return object.save();
    }).fail((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('does not enable delete with public read', (done) => {
    let user = new Parse.User();
    let object = new Parse.Object(TestObject);
    user.set('username', 'deleter3');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      object.getACL().setPublicReadAccess(true);
      return object.save();
    }).then(() => {
      Parse.User.logOut();
      return object.destroy();
    }).fail((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('does not enable get with public write', (done) => {
    let user = new Parse.User();
    let object = new TestObject();
    user.set('username', 'getter4');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      object.getACL().setPublicWriteAccess(true);
      return object.save();
    }).then(() => {
      Parse.User.logOut();
      return new Parse.Query(TestObject).get(object.id);
    }).fail((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('does not enable find with public write', (done) => {
    let user = new Parse.User();
    let object = new Parse.Object('AnotherUniqueObject');
    user.set('username', 'finder4');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      object.getACL().setPublicWriteAccess(true);
      return object.save();
    }).then(() => {
      Parse.User.logOut();
      return new Parse.Query('AnotherUniqueObject').find();
    }).then((o) => {
      assert.equal(o.length, 0);
      done();
    });
  });

  it('enables update with public read', (done) => {
    let user = new Parse.User();
    let object = new Parse.Object('UniqueObject');
    user.set('username', 'updater4');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      object.getACL().setPublicWriteAccess(true);
      return object.save();
    }).then(() => {
      Parse.User.logOut();
      object.set('score', 10);
      return object.save();
    }).then(() => {
      done();
    });
  });

  it('enables delete with public read', (done) => {
    let user = new Parse.User();
    let object = new TestObject();
    user.set('username', 'deleter4');
    user.set('password', 'secret');
    user.signUp().then(() => {
      let acl = new Parse.ACL(user);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      object.getACL().setPublicWriteAccess(true);
      return object.save();
    }).then(() => {
      Parse.User.logOut();
      return object.destroy();
    }).then(() => {
      done();
    });
  });

  it('can grant get access to another user', (done) => {
    let user1, user2;
    let object = new TestObject();
    Parse.User.signUp('aaa', 'password').then((u) => {
      user1 = u;
      Parse.User.logOut();

      return Parse.User.signUp('bbb', 'password');
    }).then((u) => {
      user2 = u;
      let acl = new Parse.ACL(user2);
      acl.setWriteAccess(user1, true);
      acl.setReadAccess(user1, true);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      return Parse.User.logIn('aaa', 'password');
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.id, object.id);
      done();
    });
  });

  it('can grant find access to another user', (done) => {
    let user1, user2;
    let object = new Parse.Object('ThatOneObject');
    Parse.User.signUp('ccc', 'password').then((u) => {
      user1 = u;
      Parse.User.logOut();

      return Parse.User.signUp('ddd', 'password');
    }).then((u) => {
      user2 = u;
      let acl = new Parse.ACL(user2);
      acl.setWriteAccess(user1, true);
      acl.setReadAccess(user1, true);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      return Parse.User.logIn('ccc', 'password');
    }).then(() => {
      let query = new Parse.Query('ThatOneObject');
      return query.find();
    }).then((o) => {
      assert(o.length > 0);
      done();
    });
  });

  it('can grant update access to another user', (done) => {
    let user1, user2;
    let object = new TestObject();
    Parse.User.signUp('eee', 'password').then((u) => {
      user1 = u;
      Parse.User.logOut();

      return Parse.User.signUp('fff', 'password');
    }).then((u) => {
      user2 = u;
      let acl = new Parse.ACL(user2);
      acl.setWriteAccess(user1, true);
      acl.setReadAccess(user1, true);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      return Parse.User.logIn('eee', 'password');
    }).then(() => {
      object.set('score', 10);
      return object.save();
    }).then((o) => {
      assert.equal(o.get('score'), 10);
      done();
    });
  });

  it('can grant delete access to another user', (done) => {
    let user1, user2;
    let object = new TestObject();
    Parse.User.signUp('ggg', 'password').then((u) => {
      user1 = u;
      Parse.User.logOut();

      return Parse.User.signUp('hhh', 'password');
    }).then((u) => {
      user2 = u;
      let acl = new Parse.ACL(user2);
      acl.setWriteAccess(user1, true);
      acl.setReadAccess(user1, true);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      return Parse.User.logIn('ggg', 'password');
    }).then(() => {
      return object.destroy();
    }).then(() => {
      done();
    });
  });

  it('does not grant public get access with another user acl', (done) => {
    let user1, user2;
    let object = new TestObject();
    Parse.User.signUp('iii', 'password').then((u) => {
      user1 = u;
      Parse.User.logOut();

      return Parse.User.signUp('jjj', 'password');
    }).then((u) => {
      user2 = u;
      let acl = new Parse.ACL(user2);
      acl.setWriteAccess(user1, true);
      acl.setReadAccess(user1, true);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      return Parse.User.logOut();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).fail((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('does not grant public find access with another user acl', (done) => {
    let user1, user2;
    let object = new Parse.Object('ThatOneObject');
    Parse.User.signUp('kkk', 'password').then((u) => {
      user1 = u;
      Parse.User.logOut();

      return Parse.User.signUp('lll', 'password');
    }).then((u) => {
      user2 = u;
      let acl = new Parse.ACL(user2);
      acl.setWriteAccess(user1, true);
      acl.setReadAccess(user1, true);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      return Parse.User.logOut();
    }).then(() => {
      let query = new Parse.Query('ThatOneObject');
      return query.find();
    }).then((o) => {
      assert.equal(o.length, 0);
      done();
    });
  });

  it('does not grant public update access with another user acl', (done) => {
    let user1, user2;
    let object = new TestObject();
    Parse.User.signUp('mmm', 'password').then((u) => {
      user1 = u;
      Parse.User.logOut();

      return Parse.User.signUp('nnn', 'password');
    }).then((u) => {
      user2 = u;
      let acl = new Parse.ACL(user2);
      acl.setWriteAccess(user1, true);
      acl.setReadAccess(user1, true);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      return Parse.User.logOut();
    }).then(() => {
      object.set('score', 10);
      return object.save();
    }).fail((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('does not grant public update access with another user acl', (done) => {
    let user1, user2;
    let object = new TestObject();
    Parse.User.signUp('ooo', 'password').then((u) => {
      user1 = u;
      Parse.User.logOut();

      return Parse.User.signUp('ppp', 'password');
    }).then((u) => {
      user2 = u;
      let acl = new Parse.ACL(user2);
      acl.setWriteAccess(user1, true);
      acl.setReadAccess(user1, true);
      object.setACL(acl);
      return object.save();
    }).then(() => {
      return Parse.User.logOut();
    }).then(() => {
      return object.destroy();
    }).fail((e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('allows access with an empty acl', (done) => {
    Parse.User.signUp('tdurden', 'mayhem', {
      ACL: new Parse.ACL(),
      foo: 'bar'
    }).then((user) => {
      Parse.User.logOut();
      return Parse.User.logIn('tdurden', 'mayhem');
    }).then((user) => {
      assert.equal(user.get('foo'), 'bar');
      done();
    });
  });

  it('fetches the ACL with included pointers', (done) => {
    let obj1 = new Parse.Object('TestClass1');
    let obj2 = new Parse.Object('TestClass2');
    let acl = new Parse.ACL();

    acl.setPublicReadAccess(true);
    obj2.set('ACL', acl);
    obj1.set('other', obj2);
    obj1.save().then(() => {
      let query = new Parse.Query('TestClass1');
      return query.first();
    }).then((obj1again) => {
      assert(obj1again);
      assert(!obj1again.get('other').get('ACL'));
      let query = new Parse.Query('TestClass1');
      query.include('other');
      return query.first();
    }).then((obj1withInclude) => {
      assert(obj1withInclude.get('other').get('ACL'));
      done();
    });
  });
});