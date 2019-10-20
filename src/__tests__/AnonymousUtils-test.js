/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../AnonymousUtils');

class MockUser {
  constructor () {
    this.className = '_User';
    this.attributes = {};
  }
  _isLinked() {}
  linkWith() {}
  static _registerAuthenticationProvider() {}
  static logInWith() {}
}

jest.setMock('../ParseUser', MockUser);

const mockProvider = {
  restoreAuthentication() {
    return true;
  },

  getAuthType() {
    return 'anonymous';
  },

  getAuthData() {
    return {
      authData: {
        id: '1234',
      },
    };
  },
};

const AnonymousUtils = require('../AnonymousUtils').default;

describe('AnonymousUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(
      AnonymousUtils,
      '_getAuthProvider'
    )
      .mockImplementation(() => mockProvider);
  });

  it('can register provider', () => {
    AnonymousUtils._getAuthProvider.mockRestore();
    jest.spyOn(MockUser, '_registerAuthenticationProvider');
    AnonymousUtils._getAuthProvider();
    AnonymousUtils._getAuthProvider();
    expect(MockUser._registerAuthenticationProvider).toHaveBeenCalledTimes(1);
  });

  it('can check user isLinked', () => {
    const user = new MockUser();
    jest.spyOn(user, '_isLinked');
    AnonymousUtils.isLinked(user);
    expect(user._isLinked).toHaveBeenCalledTimes(1);
    expect(user._isLinked).toHaveBeenCalledWith('anonymous');
    expect(AnonymousUtils._getAuthProvider).toHaveBeenCalledTimes(1);
  });

  it('can link user', () => {
    const user = new MockUser();
    jest.spyOn(user, 'linkWith');
    AnonymousUtils.link(user);
    expect(user.linkWith).toHaveBeenCalledTimes(1);
    expect(user.linkWith).toHaveBeenCalledWith('anonymous', mockProvider.getAuthData(), undefined);
    expect(AnonymousUtils._getAuthProvider).toHaveBeenCalledTimes(1);
  });

  it('can login user', () => {
    jest.spyOn(MockUser, 'logInWith');
    AnonymousUtils.logIn();
    expect(MockUser.logInWith).toHaveBeenCalledTimes(1);
    expect(MockUser.logInWith).toHaveBeenCalledWith('anonymous', mockProvider.getAuthData(), undefined);
    expect(AnonymousUtils._getAuthProvider).toHaveBeenCalledTimes(1);
  });
});
