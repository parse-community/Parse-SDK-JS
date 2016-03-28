'use strict';

const assert = require('assert');
const clear = require('./clear');
const mocha = require('mocha');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');

describe('Parse User', () => {
  before(() => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
  });

  beforeEach((done) => {
    let promise = Parse.Promise.as();
    try {
      promise = Parse.User.logOut();
    } catch (e) {}
    promise.then(() => {
      return clear();
    }).then(() => {
      done();
    });
  });

  it('can sign up users via static method', (done) => {
    Parse.User.signUp('asdf', 'zxcv').then((user) => {
      assert(user.getSessionToken());
      done();
    });
  });

  it('can sign up via instance method', (done) => {
    let user = new Parse.User();
    user.setPassword('asdf');
    user.setUsername('zxcv');
    user.signUp().then((user) => {
      assert(user.getSessionToken());
      done();
    });
  });

  it('fails log in with wrong username', (done) => {
    Parse.User.signUp('asdf', 'zxcv').then(() => {
      return Parse.User.logIn('false_user', 'asdf3');
    }).then(null, () => {
      done();
    });
  });

  it('fails log in with wrong password', (done) => {
    Parse.User.signUp('asdf', 'zxcv').then(() => {
      return Parse.User.logIn('asdf', 'asdfWrong');
    }).then(null, () => {
      done();
    });
  });

  it('can log in a user', (done) => {
    Parse.User.signUp('asdf', 'zxcv').then(() => {
      return Parse.User.logIn('asdf', 'zxcv');
    }).then((user) => {
      assert.equal(user.get('username'), 'asdf');
      done();
    });
  });

  it('can become a user', (done) => {
    Parse.User.enableUnsafeCurrentUser();
    let user = null;
    let session = null;
    Parse.User.signUp('jason', 'parse', {'code': 'red'}).then((newUser) => {
      assert.equal(Parse.User.current(), newUser);
      user = newUser;
      session = newUser.getSessionToken();
      assert(session);

      return Parse.User.logOut();
    }).then(() => {
      assert(!Parse.User.current());

      return Parse.User.become(sessionToken);
    }).then((user) => {
      assert.equal(Parse.User.current(), user);
      assert(user);
      assert.equal(user.id, newUser.id)
      assert.equal(user.get('code'), 'red');

      return Parse.User.logOut();
    }).then(() => {
      assert(!Parse.User.current());

      return Parse.User.become('garbage');
    }).then(null, () => {
      done();
    });
  });

  it('cannot save non-authed user', (done) => {
    let user = new Parse.User();
    let notAuthed = null;
    user.set({
      password: 'asdf',
      email: 'asdf@example.com',
      username: 'zxcv',
    });
    user.signUp().then((userAgain) => {
      assert.equal(user, userAgain);
      let query = new Parse.Query(Parse.User);
      return query.get(user.id);
    }).then((userNotAuthed) => {
      notAuthed = userNotAuthed;
      user = new Parse.User();
      user.set({
        username: 'hacker',
        password: 'password',
      });
      return user.signUp();
    }).then((userAgain) => {
      assert.equal(userAgain, user);
      notAuthed.set('username', 'changed');
      return notAuthed.save();
    }).then(null, (e) => {
      assert.equal(e.code, Parse.Error.SESSION_MISSING);
      done();
    });
  });

  it('cannot delete non-authed user', (done) => {
    let user = new Parse.User();
    let notAuthed = null;
    user.signUp({
      password: 'asdf',
      email: 'asdf@example.com',
      username: 'zxcv',
    }).then(() => {
      let query = new Parse.Query(Parse.User);
      return query.get(user.id);
    }).then((userNotAuthed) => {
      notAuthed = userNotAuthed;
      user = new Parse.User();
      return user.signUp({
        username: 'hacker',
        password: 'password',
      });
    }).then((userAgain) => {
      assert.equal(userAgain, user);
      notAuthed.set('username', 'changed');
      return notAuthed.destroy();
    }).then(null, (e) => {
      assert.equal(e.code, Parse.Error.SESSION_MISSING);
      done();
    });
  });

  it('cannot saveAll with non-authed user', (done) => {
    let user = new Parse.User();
    let notAuthed = null;
    user.signUp({
      password: 'asdf',
      email: 'asdf@example.com',
      username: 'zxcv',
    }).then(() => {
      let query = new Parse.Query(Parse.User);
      return query.get(user.id);
    }).then((userNotAuthed) => {
      notAuthed = userNotAuthed;
      user = new Parse.User();
      return user.signUp({
        username: 'hacker',
        password: 'password',
      });
    }).then(() => {
      let query = new Parse.Query(Parse.User);
      return query.get(user.id);
    }).then((userNotAuthedNotChanged) => {
      notAuthed.set('username', 'changed');
      let object = new TestObject();
      return object.save({ user: userNotAuthedNotChanged });
    }).then((o) => {
      let item1 = new TestObject();
      return item1.save({ number: 0 });
    }).then((item1) => {
      item1.set('number', 1);
      let item2 = new TestObject();
      item2.set('number', 2);
      return Parse.Object.saveAll([item1, item2, notAuthed]);
    }).then(null, (e) => {
      assert.equal(e.code, Parse.Error.SESSION_MISSING);
      done();
    });
  });

  it('can store the current user', (done) => {
    Parse.User.enableUnsafeCurrentUser();
    let user = new Parse.User();
    user.set('password', 'asdf');
    user.set('email', 'asdf@example.com');
    user.set('username', 'zxcv');
    user.signUp().then(() => {
      let current = Parse.User.current();
      assert.equal(user.id, current.id);
      assert(user.getSessionToken());

      let currentAgain = Parse.User.current();
      assert.equal(current, currentAgain);

      return Parse.User.logOut();
    }).then(() => {
      assert.equal(Parse.User.current(), null);
      done();
    });
  });

  it('can test if a user is current', (done) => {
    Parse.User.enableUnsafeCurrentUser();
    let user1 = new Parse.User();
    let user2 = new Parse.User();
    let user3 = new Parse.User();

    user1.set('username', 'a');
    user2.set('username', 'b');
    user3.set('username', 'c');

    user1.set('password', 'password');
    user2.set('password', 'password');
    user3.set('password', 'password');

    user1.signUp().then(() => {
      assert(user1.isCurrent());
      assert(!user2.isCurrent());
      assert(!user3.isCurrent());

      return user2.signUp();
    }).then(() => {
      assert(!user1.isCurrent());
      assert(user2.isCurrent());
      assert(!user3.isCurrent());

      return user3.signUp();
    }).then(() => {
      assert(!user1.isCurrent());
      assert(!user2.isCurrent());
      assert(user3.isCurrent());

      return Parse.User.logIn('a', 'password');
    }).then(() => {
      assert(user1.isCurrent());
      assert(!user2.isCurrent());
      assert(!user3.isCurrent());

      return Parse.User.logIn('b', 'password');
    }).then(() => {
      assert(!user1.isCurrent());
      assert(user2.isCurrent());
      assert(!user3.isCurrent());

      return Parse.User.logIn('c', 'password');
    }).then(() => {
      assert(!user1.isCurrent());
      assert(!user2.isCurrent());
      assert(user3.isCurrent());

      return Parse.User.logOut();
    }).then(() => {
      assert(!user3.isCurrent());
      done();
    });
  });

  it('can query for users', (done) => {
    let user = new Parse.User();
    user.set('password', 'asdf');
    user.set('email', 'asdf@exxample.com');
    user.set('username', 'zxcv');
    user.signUp().then(() => {
      let query = new Parse.Query(Parse.User);
      return query.get(user.id);
    }).then((u) => {
      assert.equal(u.id, user.id);
      return new Parse.Query(Parse.User).find();
    }).then((users) => {
      assert.equal(users.length, 1);
      assert.equal(users[0].id, user.id);
      done();
    });
  });

  it('preserves the session token when querying the current user', (done) => {
    let user = new Parse.User();
    user.set('password', 'asdf');
    user.set('email', 'asdf@example.com');
    user.set('username', 'zxcv');
    user.signUp().then(() => {
      assert(user.has('sessionToken'));
      let query = new Parse.Query(Parse.User);
      return query.get(user.id);
    }).then((u) => {
      // Old object maintains token
      assert(user.has('sessionToken'));
      // New object doesn't have token
      assert(!u.has('sessionToken'));
      done();
    });
  });

  it('does not log in a user when saving', (done) => {
    Parse.User.enableUnsafeCurrentUser();
    let user = new Parse.User();
    user.save({
      password: 'asdf',
      email: 'asdf@example.com',
      username: 'zxcv',
    }).then(() => {
      assert(!Parse.User.current());
      done();
    });
  });

  it('can update users', (done) => {
    let user = new Parse.User();
    user.signUp({
      password: 'asdf',
      email: 'asdf@example.com',
      username: 'zxcv',
    }).then(() => {
      user.set('username', 'test');
      return user.save();
    }).then(() => {
      assert.equal(Object.keys(user.attributes).length, 6);
      assert(user.attributes.hasOwnProperty('username'));
      assert(user.attributes.hasOwnProperty('email'));
      return user.destroy();
    }).then(() => {
      let query = new Parse.Query(Parse.User);
      return query.get(user.id);
    }).then(null, (e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('can count users', (done) => {
    let james = new Parse.User();
    james.set('username', 'james');
    james.set('password', 'mypass');
    james.signUp().then(() => {
      let kevin = new Parse.User();
      kevin.set('username', 'kevin');
      kevin.set('password', 'mypass');
      return kevin.signUp();
    }).then(() => {
      let query = new Parse.Query(Parse.User);
      return query.count();
    }).then((c) => {
      assert.equal(c, 2);
      done();
    });
  });

  it('can sign up user with container class', (done) => {
    Parse.User.signUp('ilya', 'mypass', { 'array': ['hello'] }).then(() => {
      done();
    });
  });

  it('handles user subclassing', (done) => {
    let SuperUser = new Parse.Object.extend('User');
    let user = new SuperUser();
    user.set('username', 'bob');
    user.set('password', 'welcome');
    assert(user instanceof Parse.User);
    user.signUp().then(() => {
      done();
    });
  });

  it('uses subclasses when doing signup', (done) => {
    let SuperUser = Parse.User.extend({
      secret() {
        return 1337;
      }
    });

    Parse.User.signUp('bob', 'welcome').then((user) => {
      assert(user instanceof SuperUser);
      assert.equal(user.secret(), 1337);
      done();
    });
  });
});