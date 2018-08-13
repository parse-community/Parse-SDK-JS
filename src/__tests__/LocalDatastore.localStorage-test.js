/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();

/* global window */

describe('LocalDatastore LocalStorage disabled', () => {
  it('isLocalStorageDisabled', () => {
    Object.defineProperty(window, 'localStorage', {
      value: null,
    });
    const LocalDatastore = require('../LocalDatastore');
    expect(LocalDatastore.isLocalStorageEnabled()).toBe(false);
  });
});
