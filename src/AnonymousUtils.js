/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow-weak
 */
import ParseUser from './ParseUser';

let registered = false;

const uuid = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

const authenticationProvider = {
  authData: {
    authData: {
      id: uuid()
    }
  },

  restoreAuthentication() {
    return true;
  },

  getAuthType() {
    return 'anonymous';
  },
};

/**
 * Provides utility functions for working with Anonymously logged-in users.
 * Anonymous users have some unique characteristics:
    - Anonymous users don't need a user name or password.
    - Once logged out, an anonymous user cannot be recovered.
    - When the current user is anonymous, the following methods can be used to switch
    to a different user or convert the anonymous user into a regular one:
    - signUp converts an anonymous user to a standard user with the given username and password.
    Data associated with the anonymous user is retained.
    - logIn switches users without converting the anonymous user.
    Data associated with the anonymous user will be lost.
    - Service logIn (e.g. Facebook, Twitter) will attempt to convert
    the anonymous user into a standard user by linking it to the service.
    If a user already exists that is linked to the service, it will instead switch to the existing user.
    - Service linking (e.g. Facebook, Twitter) will convert the anonymous user
    into a standard user by linking it to the service.
 * @class Parse.AnonymousUtils
 * @static
 */
const AnonymousUtils = {
  /**
   * Gets whether the user has their account linked to anonymous user.
   *
   * @method isLinked
   * @name Parse.AnonymousUtils.isLinked
   * @param {Parse.User} user User to check for.
   *     The user must be logged in on this device.
   * @return {Boolean} <code>true</code> if the user has their account
   *     linked to an anonymous user.
   */
  isLinked(user) {
    const provider = this._getAuthProvider();
    return user._isLinked(provider.getAuthType());
  },

  /**
   * Logs in a user Anonymously.
   *
   * @method logIn
   * @name Parse.AnonymousUtils.logIn
   * @returns {Promise}
   */
  logIn() {
    const provider = this._getAuthProvider();
    return ParseUser._logInWith(provider.getAuthType(), provider.authData);
  },

  /**
   * Links Anonymous User to an existing PFUser.
   *
   * @method link
   * @name Parse.AnonymousUtils.link
   * @param {Parse.User} user User to link. This must be the current user.
   * @returns {Promise}
   */
  link(user) {
    const provider = this._getAuthProvider();
    return user._linkWith(provider.getAuthType(), provider.authData);
  },

  _getAuthProvider() {
    const provider = authenticationProvider;
    if (!registered) {
      ParseUser._registerAuthenticationProvider(provider);
      registered = true;
    }
    return provider;
  }
};

export default AnonymousUtils;
