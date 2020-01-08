/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../FacebookUtils');

class MockUser {
  constructor () {
    this.className = '_User';
    this.attributes = {};
  }
  _isLinked() {}
  linkWith() {}
  _unlinkFrom() {}
  static _registerAuthenticationProvider() {}
  static logInWith() {}
}

jest.setMock('../ParseUser', MockUser);

const FacebookUtils = require('../FacebookUtils').default;

describe('FacebookUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
  });

  it('can not init without FB SDK', () => {
    global.FB = undefined;
    try {
      FacebookUtils.init();
    } catch (e) {
      expect(e.message).toBe('The Facebook JavaScript SDK must be loaded before calling init.');
    }
  });

  it('can not login without init', async () => {
    try {
      await FacebookUtils.logIn();
    } catch (e) {
      expect(e.message).toBe('You must initialize FacebookUtils before calling logIn.');
    }
  });

  it('can not link without init', async () => {
    try {
      const user = new MockUser();
      await FacebookUtils.link(user);
    } catch (e) {
      expect(e.message).toBe('You must initialize FacebookUtils before calling link.');
    }
  });

  it('can not unlink without init', () => {
    try {
      const user = new MockUser();
      FacebookUtils.unlink(user);
    } catch (e) {
      expect(e.message).toBe('You must initialize FacebookUtils before calling unlink.');
    }
  });

  it('can init', () => {
    FacebookUtils.init();
  });

  it('can init with options', () => {
    jest.spyOn(console, 'warn')
      .mockImplementationOnce(() => {
        return {
          call: () => {}
        }
      })
    FacebookUtils.init({ status: true });
    expect(console.warn).toHaveBeenCalled();
  });

  it('can link', async () => {
    FacebookUtils.init();
    const user = new MockUser();
    await FacebookUtils.link(user);
  });

  it('can link with permission string', async () => {
    FacebookUtils.init();
    const user = new MockUser();
    await FacebookUtils.link(user, 'public_profile');
  });

  it('can link with authData object', async () => {
    FacebookUtils.init();
    const user = new MockUser();
    const authData = {
      id: '1234'
    };
    jest.spyOn(user, 'linkWith');
    await FacebookUtils.link(user, authData);
    expect(user.linkWith).toHaveBeenCalledWith('facebook', { authData: { id: '1234' } }, undefined);
  });

  it('can link with options', async () => {
    FacebookUtils.init();
    const user = new MockUser();
    jest.spyOn(user, 'linkWith');
    await FacebookUtils.link(user, {}, { useMasterKey: true });
    expect(user.linkWith).toHaveBeenCalledWith('facebook', { authData: {} }, { useMasterKey: true });
  });

  it('can check isLinked', async () => {
    FacebookUtils.init();
    const user = new MockUser();
    jest.spyOn(user, '_isLinked');
    await FacebookUtils.isLinked(user);
    expect(user._isLinked).toHaveBeenCalledWith('facebook');
  });

  it('can unlink', async () => {
    FacebookUtils.init();
    const user = new MockUser();
    const spy = jest.spyOn(user, '_unlinkFrom');
    await FacebookUtils.unlink(user);
    expect(user._unlinkFrom).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('can login', async () => {
    FacebookUtils.init();
    await FacebookUtils.logIn();
  });

  it('can login with permission string', async () => {
    FacebookUtils.init();
    jest.spyOn(MockUser, 'logInWith');
    await FacebookUtils.logIn('public_profile');
    expect(MockUser.logInWith).toHaveBeenCalledTimes(1);
  });

  it('can login with authData', async () => {
    FacebookUtils.init();
    jest.spyOn(MockUser, 'logInWith');
    await FacebookUtils.logIn({ id: '1234' });
    expect(MockUser.logInWith).toHaveBeenCalledTimes(1);
  });

  it('can login with options', async () => {
    FacebookUtils.init();
    jest.spyOn(MockUser, 'logInWith');
    await FacebookUtils.logIn({}, { useMasterKey: true });
    expect(MockUser.logInWith).toHaveBeenCalledWith('facebook', { authData: {} }, {useMasterKey: true });
  });

  it('provider getAuthType', async () => {
    const provider = FacebookUtils._getAuthProvider();
    expect(provider.getAuthType()).toBe('facebook');
  });

  it('provider deauthenticate', async () => {
    const provider = FacebookUtils._getAuthProvider();
    jest.spyOn(provider, 'restoreAuthentication');
    provider.deauthenticate();
    expect(provider.restoreAuthentication).toHaveBeenCalled();
  });
});

describe('FacebookUtils provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('restoreAuthentication', async () => {
    const provider = FacebookUtils._getAuthProvider();
    const didRestore = provider.restoreAuthentication();
    expect(didRestore).toBe(true);
  });

  it('restoreAuthentication with invalid authData', async () => {
    global.FB = {
      init: () => {},
      logout: () => {},
      getAuthResponse: () => {
        return { userID: '5678' };
      },
    };
    jest.spyOn(global.FB, 'logout');
    const provider = FacebookUtils._getAuthProvider();
    provider.restoreAuthentication({ id: '1234'});
    expect(global.FB.logout).toHaveBeenCalled();
  });

  it('restoreAuthentication with valid authData', async () => {
    global.FB = {
      init: () => {},
      getAuthResponse: () => {
        return { userID: '1234' };
      },
    };
    FacebookUtils.init({ status: false });
    jest.spyOn(global.FB, 'init');
    const provider = FacebookUtils._getAuthProvider();
    provider.restoreAuthentication({ id: '1234'});
    expect(global.FB.init).toHaveBeenCalled();
  });

  it('restoreAuthentication with valid authData', async () => {
    global.FB = {
      init: () => {},
      getAuthResponse: () => {
        return { userID: '1234' };
      },
    };
    FacebookUtils.init({ status: false });
    jest.spyOn(global.FB, 'init');
    const provider = FacebookUtils._getAuthProvider();
    provider.restoreAuthentication({ id: '1234'});
    expect(global.FB.init).toHaveBeenCalled();
  });

  it('authenticate without FB error', async () => {
    global.FB = undefined;
    const options = {
      error: () => {}
    };
    jest.spyOn(options, 'error');
    const provider = FacebookUtils._getAuthProvider();
    try {
      provider.authenticate(options);
    } catch (e) {
      expect(options.error).toHaveBeenCalledWith(provider, 'Facebook SDK not found.');
    }
  });

  it('authenticate with FB response', async () => {
    const authResponse = {
      userID: '1234',
      accessToken: 'access_token',
      expiresIn: '2000-01-01',
    };
    global.FB = {
      init: () => {},
      login: (cb) => {
        cb({ authResponse });
      },
    };
    const options = {
      success: () => {}
    };
    jest.spyOn(options, 'success');
    const provider = FacebookUtils._getAuthProvider();
    provider.authenticate(options);
    expect(options.success).toHaveBeenCalledWith(provider, { access_token: 'access_token', expiration_date: null, id: '1234' });
  });

  it('authenticate with no FB response', async () => {
    global.FB = {
      init: () => {},
      login: (cb) => {
        cb({});
      },
    };
    const options = {
      error: () => {}
    };
    jest.spyOn(options, 'error');
    const provider = FacebookUtils._getAuthProvider();
    provider.authenticate(options);
    expect(options.error).toHaveBeenCalledWith(provider, {});
  });

  it('getAuthType', async () => {
    const provider = FacebookUtils._getAuthProvider();
    expect(provider.getAuthType()).toBe('facebook');
  });

  it('deauthenticate', async () => {
    const provider = FacebookUtils._getAuthProvider();
    jest.spyOn(provider, 'restoreAuthentication');
    provider.deauthenticate();
    expect(provider.restoreAuthentication).toHaveBeenCalled();
  });
});
