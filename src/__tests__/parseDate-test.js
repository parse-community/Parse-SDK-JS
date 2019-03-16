/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();

const parseDate = require('../parseDate').default;

describe('parseDate', () => {
  it('returns a Date for valid strings', () => {
    expect(Number(parseDate('2013-12-14T04:51:19.582Z'))).toBe(
      Number(new Date(Date.UTC(2013, 11, 14, 4, 51, 19, 582)))
    );
    expect(Number(parseDate('2013-12-14T04:51:19Z'))).toBe(
      Number(new Date(Date.UTC(2013, 11, 14, 4, 51, 19)))
    );
  });

  it('returns null for invalid strings', () => {
    expect(parseDate('asdf')).toBe(null);
  });
})
