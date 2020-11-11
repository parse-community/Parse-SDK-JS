jest.autoMockOff();

const { when } = require('../promiseUtils');

describe('promiseUtils', () => {
  it('when', async () => {
    const promise1 = Promise.resolve(1);
    const promise2 = Promise.resolve(2);

    let result = await when([]);
    expect(result).toEqual([[]]);

    result = await when(promise1, promise2);
    expect(result).toEqual([1, 2]);

    result = await when(promise1, 'not a promise');
    expect(result).toEqual([1, 'not a promise']);
  });
});
