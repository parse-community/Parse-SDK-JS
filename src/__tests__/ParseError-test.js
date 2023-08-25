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

  it('message can be a string', () => {
    const someRandomError = 'oh no';

    const error = new ParseError(1337, someRandomError);

    expect(JSON.parse(JSON.stringify(error))).toEqual({
      message: someRandomError,
      code: 1337,
    });
  });

  it('message can be an object passed trough some external dependency', () => {
    const someRandomError = { code: '420', message: 'time to chill', status: '🎮' };

    const error = new ParseError(1337, someRandomError);

    expect(JSON.parse(JSON.stringify(error))).toEqual({
      message: '420 time to chill 🎮',
      code: 1337,
    });
  });

  it('message can be an Error instance *receiving a string* passed trough some external dependency', () => {
    const someRandomError = new Error('good point');

    const error = new ParseError(1337, someRandomError);

    expect(JSON.parse(JSON.stringify(error))).toEqual({
      message: 'Error: good point',
      code: 1337,
    });
  });

  it('message can be an Error instance *receiving an object* passed trough some external dependency', () => {
    const someRandomErrorWrong = new Error({
      code: 'WRONG',
      message: 'this is not how errors should be handled',
    });

    const error = new ParseError(1337, someRandomErrorWrong);

    expect(JSON.parse(JSON.stringify(error))).toEqual({
      message: '', // <-- Yeah because we can't parse errors used like that
      code: 1337,
    });
  });
});
