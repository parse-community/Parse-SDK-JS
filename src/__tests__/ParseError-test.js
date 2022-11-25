/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../ParseError');

const ParseError = require('../ParseError').default;

describe('ParseError', () => {
  it('have sensible string representation', () => {
    const error = new ParseError(123, 'some error message');

    expect(error.toString()).toMatch('ParseError');
    expect(error.toString()).toMatch('123');
    expect(error.toString()).toMatch('some error message');
  });

  it('has a proper json representation', () => {
    const error = new ParseError(123, 'some error message');
    expect(JSON.parse(JSON.stringify(error))).toEqual({
      message: 'some error message',
      code: 123,
    });
  });

  it('message must be a string', () => {
    /**
     * error as object
     */
    const someRandomError = { code: 420, message: 'time to chill' };
    const error = new ParseError(1337, someRandomError);
    expect(JSON.parse(JSON.stringify(error))).toEqual({
      message: JSON.stringify(someRandomError),
      code: 1337,
    });

    /**
     * error as an Error instance
     */
    const someRandomError2 = new Error('time to relax');
    const error2 = new ParseError(420, someRandomError2);

    expect(JSON.parse(JSON.stringify(error2))).toEqual({
      message: 'Error: time to relax',
      code: 420,
    });
  });
});
