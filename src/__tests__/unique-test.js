jest.dontMock('../arrayContainsObject');
jest.dontMock('../unique');

let localCount = 0;
const mockObject = function (className, id) {
  this.className = className;
  this.id = id;
  if (!id) {
    this._localId = 'local' + localCount++;
  }
};
mockObject.prototype._getId = function () {
  return this.id || this._localId;
};
jest.setMock('../ParseObject', mockObject);

const unique = require('../unique').default;
const ParseObject = require('../ParseObject');
const CoreManager = require('../CoreManager');
jest.spyOn(CoreManager, 'getParseObject').mockImplementation(() => require('../ParseObject'));

describe('unique', () => {
  it('produces an array with unique elements', () => {
    expect(unique([])).toEqual([]);
    expect(unique([1])).toEqual([1]);
    expect(unique([3, 4, 1])).toEqual([3, 4, 1]);
    expect(unique([3, 4, 3, 1])).toEqual([3, 4, 1]);
    expect(unique([2, 2, 2, 2, 2, 2, 2])).toEqual([2]);
    expect(unique(['a', 'b', 'c', 'a', 'd'])).toEqual(['a', 'b', 'c', 'd']);
  });

  it('dedups objects by their id', () => {
    const o = new ParseObject('Item');
    expect(unique([o, o, o])).toEqual([o]);
    expect(unique([new ParseObject('Item'), new ParseObject('Item')]).length).toBe(2);
    expect(
      unique([
        new ParseObject('Item', 'a'),
        new ParseObject('Item', 'b'),
        new ParseObject('Item', 'a'),
      ])
    ).toEqual([new ParseObject('Item', 'a'), new ParseObject('Item', 'b')]);
    expect(
      unique([
        new ParseObject('Item', 'a'),
        new ParseObject('Item', 'b'),
        new ParseObject('Item', 'b'),
        new ParseObject('Item', 'a'),
      ])
    ).toEqual([new ParseObject('Item', 'a'), new ParseObject('Item', 'b')]);
  });
});
