'use strict';

const { Parse } = require('../../node');

describe('Parse Legacy Import', () => {
  it('can query object', async () => {
    const object = new Parse.Object('TestObject');
    object.set('foo', 'bar');
    await object.save();
    const query = new Parse.Query('TestObject');
    const result = await query.get(object.id);
    expect(result.id).toBe(object.id);
  });
});
