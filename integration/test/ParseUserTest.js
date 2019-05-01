'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');

class CustomUser extends Parse.User {
  constructor(attributes) {
    super(attributes);
  }

  doSomething() {
    return 5;
  }
}
Parse.Object.registerSubclass('CustomUser', CustomUser);

const provider = {
  authenticate: () => Promise.resolve(),
  restoreAuthentication: () => true,
  getAuthType: () => 'anonymous',
  getAuthData() {
    return {
      authData: {
        id: '1234',
      },
    };
  },
};
Parse.User._registerAuthenticationProvider(provider);

const authResponse = {
  userID: 'test',
  accessToken: 'test',
  expiresIn: 'test', // Should be unix timestamp
};
global.FB = {
  init: () => {},
  login: (cb) => {
    cb({ authResponse });
  },
  getAuthResponse: () => authResponse,
};

describe('Parse User', () => {
  beforeAll(() => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
  });

  beforeEach((done) => {
    let promise = Promise.resolve();
    try {
      promise = Parse.User.logOut();
    } catch (e) { /**/ } // eslint-disable-line no-unused-vars
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
    const user = new Parse.User();
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
    let session = null;
    let newUser = null;
    Parse.User.signUp('jason', 'parse', {'code': 'red'}).then((user) => {
      newUser = user;
      assert.equal(Parse.User.current(), newUser);
      session = newUser.getSessionToken();
      assert(session);

      return Parse.User.logOut();
    }).then(() => {
      assert(!Parse.User.current());

      return Parse.User.become(session);
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
      const query = new Parse.Query(Parse.User);
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
      const query = new Parse.Query(Parse.User);
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
      const query = new Parse.Query(Parse.User);
      return query.get(user.id);
    }).then((userNotAuthed) => {
      notAuthed = userNotAuthed;
      user = new Parse.User();
      return user.signUp({
        username: 'hacker',
        password: 'password',
      });
    }).then(() => {
      const query = new Parse.Query(Parse.User);
      return query.get(user.id);
    }).then((userNotAuthedNotChanged) => {
      notAuthed.set('username', 'changed');
      const object = new TestObject();
      return object.save({ user: userNotAuthedNotChanged });
    }).then(() => {
      const item1 = new TestObject();
      return item1.save({ number: 0 });
    }).then((item1) => {
      item1.set('number', 1);
      const item2 = new TestObject();
      item2.set('number', 2);
      return Parse.Object.saveAll([item1, item2, notAuthed]);
    }).then(null, (e) => {
      assert.equal(e.code, Parse.Error.SESSION_MISSING);
      done();
    });
  });

  it('can fetch non-auth user with include', async () => {
    Parse.User.enableUnsafeCurrentUser();

    const child = new Parse.Object('TestObject');
    child.set('field', 'test');
    const user = new Parse.User();
    user.set('password', 'asdf');
    user.set('email', 'asdf@exxample.com');
    user.set('username', 'zxcv');
    user.set('child', child);
    await user.signUp();

    const query = new Parse.Query(Parse.User);
    const userNotAuthed = await query.get(user.id);

    assert.equal(userNotAuthed.get('child').get('field'), undefined);

    const fetchedUser = await userNotAuthed.fetchWithInclude('child');

    assert.equal(userNotAuthed.get('child').get('field'), 'test');
    assert.equal(fetchedUser.get('child').get('field'), 'test');
  });

  it('can fetch auth user with include', async () => {
    Parse.User.enableUnsafeCurrentUser();

    const child = new Parse.Object('TestObject');
    child.set('field', 'test');
    let user = new Parse.User();
    user.set('password', 'asdf');
    user.set('email', 'asdf@exxample.com');
    user.set('username', 'zxcv');
    user.set('child', child);
    await user.signUp();

    user = await Parse.User.logIn('zxcv', 'asdf');

    assert.equal(user.get('child').get('field'), undefined);
    assert.equal(Parse.User.current().get('child').get('field'), undefined);

    const fetchedUser = await user.fetchWithInclude('child');
    const current = await Parse.User.currentAsync();

    assert.equal(user.get('child').get('field'), 'test');
    assert.equal(current.get('child').get('field'), 'test');
    assert.equal(fetchedUser.get('child').get('field'), 'test');
    assert.equal(Parse.User.current().get('child').get('field'), 'test');
  });

  it('can store the current user', (done) => {
    Parse.User.enableUnsafeCurrentUser();
    const user = new Parse.User();
    user.set('password', 'asdf');
    user.set('email', 'asdf@example.com');
    user.set('username', 'zxcv');
    user.signUp().then(() => {
      const current = Parse.User.current();
      assert.equal(user.id, current.id);
      assert(user.getSessionToken());

      const currentAgain = Parse.User.current();
      assert.equal(current, currentAgain);

      return Parse.User.logOut();
    }).then(() => {
      assert.equal(Parse.User.current(), null);
      done();
    });
  });

  it('can test if a user is current', (done) => {
    Parse.User.enableUnsafeCurrentUser();
    const user1 = new Parse.User();
    const user2 = new Parse.User();
    const user3 = new Parse.User();

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
    const user = new Parse.User();
    user.set('password', 'asdf');
    user.set('email', 'asdf@exxample.com');
    user.set('username', 'zxcv');
    user.signUp().then(() => {
      const query = new Parse.Query(Parse.User);
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
    const user = new Parse.User();
    user.set('password', 'asdf');
    user.set('email', 'asdf@example.com');
    user.set('username', 'zxcv');
    user.signUp().then(() => {
      assert(user.has('sessionToken'));
      const query = new Parse.Query(Parse.User);
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
    const user = new Parse.User();
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
    const user = new Parse.User();
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
      const query = new Parse.Query(Parse.User);
      return query.get(user.id);
    }).then(null, (e) => {
      assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      done();
    });
  });

  it('can count users', (done) => {
    const james = new Parse.User();
    james.set('username', 'james');
    james.set('password', 'mypass');
    james.signUp().then(() => {
      const kevin = new Parse.User();
      kevin.set('username', 'kevin');
      kevin.set('password', 'mypass');
      return kevin.signUp();
    }).then(() => {
      const query = new Parse.Query(Parse.User);
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
    const SuperUser = Parse.Object.extend('User');
    const user = new SuperUser();
    user.set('username', 'bob');
    user.set('password', 'welcome');
    assert(user instanceof Parse.User);
    user.signUp().then(() => {
      done();
    });
  });

  it('uses subclasses when doing signup', (done) => {
    const SuperUser = Parse.User.extend({
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

  it('can save anonymous user', async () => {
    Parse.User.enableUnsafeCurrentUser();

    const user = await Parse.AnonymousUtils.logIn();
    user.set('field', 'hello');
    await user.save();

    const query = new Parse.Query(Parse.User);
    const result = await query.get(user.id);
    expect(result.get('field')).toBe('hello');
  });

  it('can not recover anonymous user if logged out', async () => {
    Parse.User.enableUnsafeCurrentUser();

    const user = await Parse.AnonymousUtils.logIn();
    user.set('field', 'hello');
    await user.save();

    await Parse.User.logOut();

    const query = new Parse.Query(Parse.User);
    try {
      await query.get(user.id);
    } catch (error) {
      expect(error.message).toBe('Object not found.');
    }
  });

  it('can signUp anonymous user and retain data', async () => {
    Parse.User.enableUnsafeCurrentUser();

    const user = await Parse.AnonymousUtils.logIn();
    user.set('field', 'hello world');
    await user.save();

    expect(user.get('authData').anonymous).toBeDefined();

    user.setUsername('foo');
    user.setPassword('baz');

    await user.signUp();

    const query = new Parse.Query(Parse.User);
    const result = await query.get(user.id);
    expect(result.get('username')).toBe('foo');
    expect(result.get('authData')).toBeUndefined();
    expect(result.get('field')).toBe('hello world');
    expect(user.get('authData').anonymous).toBeUndefined();
  });

  it('can logIn user without converting anonymous user', async () => {
    Parse.User.enableUnsafeCurrentUser();

    await Parse.User.signUp('foobaz', '1234');

    const user = await Parse.AnonymousUtils.logIn();
    user.set('field', 'hello world');
    await user.save();

    await Parse.User.logIn('foobaz', '1234');

    const query = new Parse.Query(Parse.User);
    try {
      await query.get(user.id);
    } catch (error) {
      expect(error.message).toBe('Object not found.');
    }
  });

  it('can signUp user with subclass', async () => {
    Parse.User.enableUnsafeCurrentUser();

    const customUser = new CustomUser({ foo: 'bar' });
    customUser.setUsername('username');
    customUser.setPassword('password');

    const user = await customUser.signUp();

    expect(user instanceof CustomUser).toBe(true);
    expect(user.doSomething()).toBe(5);
    expect(user.get('foo')).toBe('bar');
  });

  it('can logIn user with subclass', async () => {
    Parse.User.enableUnsafeCurrentUser();

    await Parse.User.signUp('username', 'password');

    const customUser = new CustomUser({ foo: 'bar' });
    customUser.setUsername('username');
    customUser.setPassword('password');

    const user = await customUser.logIn();

    expect(user instanceof CustomUser).toBe(true);
    expect(user.doSomething()).toBe(5);
    expect(user.get('foo')).toBe('bar');
  });

  it('can signUp / logIn user with subclass static', async () => {
    Parse.User.enableUnsafeCurrentUser();

    let user = await CustomUser.signUp('username', 'password');
    expect(user instanceof CustomUser).toBe(true);
    expect(user.doSomething()).toBe(5);

    user = await CustomUser.logIn('username', 'password');
    expect(user instanceof CustomUser).toBe(true);
    expect(user.doSomething()).toBe(5);
  });

  it('can link without master key', async () => {
    Parse.User.enableUnsafeCurrentUser();

    const user = new Parse.User();
    user.setUsername('Alice');
    user.setPassword('sekrit');
    await user.signUp();
    await user._linkWith(provider.getAuthType(), provider.getAuthData());
    expect(user._isLinked(provider)).toBe(true);
    await user._unlinkFrom(provider);
    expect(user._isLinked(provider)).toBe(false);
  });

  it('can link with master key', async () => {
    Parse.User.disableUnsafeCurrentUser();

    const user = new Parse.User();
    user.setUsername('Alice');
    user.setPassword('sekrit');
    await user.save(null, { useMasterKey: true });
    await user._linkWith(provider.getAuthType(), provider.getAuthData(), { useMasterKey: true });
    expect(user._isLinked(provider)).toBe(true);
    await user._unlinkFrom(provider, { useMasterKey: true });
    expect(user._isLinked(provider)).toBe(false);
  });

  it('can link with session token', async () => {
    Parse.User.disableUnsafeCurrentUser();

    const user = new Parse.User();
    user.setUsername('Alice');
    user.setPassword('sekrit');
    await user.signUp();
    expect(user.isCurrent()).toBe(false);

    const sessionToken = user.getSessionToken();
    await user._linkWith(provider.getAuthType(), provider.getAuthData(), { sessionToken });
    expect(user._isLinked(provider)).toBe(true);
    await user._unlinkFrom(provider, { sessionToken });
    expect(user._isLinked(provider)).toBe(false);
  });

  it('linked account can login with authData', async () => {
    const user = new Parse.User();
    user.setUsername('Alice');
    user.setPassword('sekrit');
    await user.save(null, { useMasterKey: true });
    await user._linkWith(provider.getAuthType(), provider.getAuthData(), { useMasterKey: true });
    expect(user._isLinked(provider)).toBe(true);
    expect(user.authenticated()).toBeFalsy();
    Parse.User.enableUnsafeCurrentUser();
    const loggedIn = await Parse.User.logInWith(provider.getAuthType(), provider.getAuthData());
    expect(loggedIn.authenticated()).toBeTruthy();
  });

  it('linking un-authenticated user without master key will throw', async (done) => {
    const user = new Parse.User();
    user.setUsername('Alice');
    user.setPassword('sekrit');
    await user.save(null, { useMasterKey: true });
    user._linkWith(provider.getAuthType(), provider.getAuthData())
      .then(() => done.fail('should fail'))
      .catch(e => expect(e.message).toBe(`Cannot modify user ${user.id}.`))
      .then(done);
  });

  it('can link with custom auth', async () => {
    Parse.User.enableUnsafeCurrentUser();
    const provider = {
      authenticate: () => Promise.resolve(),
      restoreAuthentication() {
        return true;
      },

      getAuthType() {
        return 'myAuth';
      },

      getAuthData() {
        return {
          authData: {
            id: 1234,
          },
        };
      },
    };
    Parse.User._registerAuthenticationProvider(provider);
    const user = new Parse.User();
    user.setUsername('Alice');
    user.setPassword('sekrit');
    await user.signUp();
    await user._linkWith(provider.getAuthType(), provider.getAuthData());
    expect(user._isLinked(provider)).toBe(true);
    await user._unlinkFrom(provider);
    expect(user._isLinked(provider)).toBe(false);
  });

  it('can login with facebook', async () => {
    Parse.User.enableUnsafeCurrentUser();
    Parse.FacebookUtils.init();
    const user = await Parse.FacebookUtils.logIn();
    expect(Parse.FacebookUtils.isLinked(user)).toBe(true);
  });

  it('can link user with facebook', async () => {
    Parse.User.enableUnsafeCurrentUser();
    Parse.FacebookUtils.init();
    const user = new Parse.User();
    user.setUsername('Alice');
    user.setPassword('sekrit');
    await user.signUp();
    await Parse.FacebookUtils.link(user);
    expect(Parse.FacebookUtils.isLinked(user)).toBe(true);
    await Parse.FacebookUtils.unlink(user);
    expect(Parse.FacebookUtils.isLinked(user)).toBe(false);
  });

  it('can link anonymous user with facebook', async () => {
    Parse.User.enableUnsafeCurrentUser();
    Parse.FacebookUtils.init();
    const user = await Parse.AnonymousUtils.logIn();
    await Parse.FacebookUtils.link(user);

    expect(Parse.FacebookUtils.isLinked(user)).toBe(true);
    expect(Parse.AnonymousUtils.isLinked(user)).toBe(true);
    await Parse.FacebookUtils.unlink(user);

    expect(Parse.FacebookUtils.isLinked(user)).toBe(false);
    expect(Parse.AnonymousUtils.isLinked(user)).toBe(true);
  });

  it('can link with twitter', async () => {
    Parse.User.enableUnsafeCurrentUser();
    const authData = {
      id: 227463280,
      consumer_key: "5QiVwxr8FQHbo5CMw46Z0jquF",
      consumer_secret: "p05FDlIRAnOtqJtjIt0xcw390jCcjj56QMdE9B52iVgOEb7LuK",
      auth_token: "227463280-k3XC8S5QzfQlOfEdGN8aHWvhWAUpGoLwzsjYQMnt",
      auth_token_secret: "uLlXKP6djaP9Fc2IdMcp9QqmsouXvDqcYVdUkWdu6pQpM"
    };
    const user = new Parse.User();
    user.setUsername('Alice');
    user.setPassword('sekrit');
    await user.signUp();

    await user._linkWith('twitter', { authData });

    expect(user.get('authData').twitter.id).toBe(authData.id);
    expect(user._isLinked('twitter')).toBe(true);

    await user._unlinkFrom('twitter');
    expect(user._isLinked('twitter')).toBe(false);
  });

  it('can link with twitter and facebook', async () => {
    Parse.User.enableUnsafeCurrentUser();
    Parse.FacebookUtils.init();
    const authData = {
      id: 227463280,
      consumer_key: "5QiVwxr8FQHbo5CMw46Z0jquF",
      consumer_secret: "p05FDlIRAnOtqJtjIt0xcw390jCcjj56QMdE9B52iVgOEb7LuK",
      auth_token: "227463280-k3XC8S5QzfQlOfEdGN8aHWvhWAUpGoLwzsjYQMnt",
      auth_token_secret: "uLlXKP6djaP9Fc2IdMcp9QqmsouXvDqcYVdUkWdu6pQpM"
    };
    const user = new Parse.User();
    user.setUsername('Alice');
    user.setPassword('sekrit');
    await user.signUp();

    await user._linkWith('twitter', { authData });
    await Parse.FacebookUtils.link(user);

    expect(Parse.FacebookUtils.isLinked(user)).toBe(true);
    expect(user._isLinked('twitter')).toBe(true);

    expect(user.get('authData').twitter.id).toBe(authData.id);
    expect(user.get('authData').facebook.id).toBe('test');
  });
});
