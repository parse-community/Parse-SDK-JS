'use strict';

/* eslint-disable no-unused-vars */
const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');

function privateTo(someone) {
  const acl = new Parse.ACL();
  acl.setReadAccess(someone, true);
  acl.setWriteAccess(someone, true);
  return acl;
}

function publicAccess() {
  const acl = new Parse.ACL();
  acl.setPublicReadAccess(true);
  acl.setPublicWriteAccess(true);
  return acl;
}

function createUser(username) {
  const user = new Parse.User();
  user.set('username', username);
  user.set('password', username);
  return user;
}

describe('Parse Role', () => {
  /** TODO: Implement these. There was some bugginess related to parse-server. **/
});

/* eslint-enable no-unused-vars */
