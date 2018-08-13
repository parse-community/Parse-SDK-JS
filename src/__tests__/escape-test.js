/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();

const escape = require('../escape.js').default;

describe('escape', () => {
  it('escapes special HTML characters', () => {
    expect(escape('&')).toBe('&amp;');
    expect(escape('<')).toBe('&lt;');
    expect(escape('>')).toBe('&gt;');
    expect(escape('\'')).toBe('&#x27;');
    expect(escape('"')).toBe('&quot;');
    expect(escape('/')).toBe('&#x2F;');

    // globally escapes
    expect(escape('<p>left & right</p>'))
      .toBe('&lt;p&gt;left &amp; right&lt;&#x2F;p&gt;');
  });
});
