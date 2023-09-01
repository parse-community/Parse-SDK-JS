jest.dontMock('../ParseError');
jest.dontMock('../CoreManager');

const ParseError = require('../ParseError').default;
const CoreManager = require('../CoreManager');

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

  it('can override message', () => {
    CoreManager.set('PARSE_ERRORS', [{ code: 123, message: 'Oops.' }]);
    const error = new ParseError(123, 'some error message');
    expect(JSON.parse(JSON.stringify(error))).toEqual({
      message: 'Oops.',
      code: 123,
    });
    CoreManager.set('PARSE_ERRORS', []);
  });
});
