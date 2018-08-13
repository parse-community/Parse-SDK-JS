/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../arrayContainsObject');

let localCount = 0;
const mockObject = function(className, id) {
  this.className = className;
  this.id = id;
  if (!id) {
    this._localId = 'local' + localCount++;
  }
}
mockObject.prototype._getId = function() {
  return this.id || this._localId;
}
jest.setMock('../ParseObject', mockObject);

const arrayContainsObject = require('../arrayContainsObject').default;
const ParseObject = require('../ParseObject');

describe('arrayContainsObject', () => {
  it('detects objects by their id', () => {
    const o = new ParseObject('Item');
    expect(arrayContainsObject([], o)).toBe(false);
    expect(arrayContainsObject([1, 'string'], o)).toBe(false);
    expect(arrayContainsObject([o], o)).toBe(true);
    expect(arrayContainsObject([
      new ParseObject('Item')
    ], new ParseObject('Item'))).toBe(false);
    expect(arrayContainsObject([
      new ParseObject('Item', 'a'),
      new ParseObject('Item', 'b')
    ], new ParseObject('Item', 'a'))).toBe(true);
  });
});
