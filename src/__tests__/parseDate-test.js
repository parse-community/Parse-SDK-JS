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
});
