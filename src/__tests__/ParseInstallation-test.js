jest.dontMock('../CoreManager');
jest.dontMock('../decode');
jest.dontMock('../ObjectStateMutations');
jest.dontMock('../ParseError');
jest.dontMock('../ParseObject');
jest.dontMock('../ParseOp');
jest.dontMock('../ParseInstallation');
jest.dontMock('../SingleInstanceStateController');
jest.dontMock('../UniqueInstanceStateController');

const ParseInstallation = require('../ParseInstallation').default;

describe('ParseInstallation', () => {
  it('can create ParseInstallation', () => {
    let installation = new ParseInstallation();
    expect(installation.className).toBe('_Installation');

    installation = new ParseInstallation({});
    expect(installation.className).toBe('_Installation');

    installation = new ParseInstallation({ deviceToken: 'token' });
    expect(installation.get('deviceToken')).toBe('token');

    expect(() => {
      new ParseInstallation({ 'invalid#name': 'foo' });
    }).toThrow("Can't create an invalid Installation");
  });
});
