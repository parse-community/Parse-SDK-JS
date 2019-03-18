'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

describe('Parse.File', () => {
  beforeEach((done) => {
    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(done).catch(done.fail);
  });

  it('can save file with uri', async () => {
    // Try https
    const parseLogo = 'https://raw.githubusercontent.com/parse-community/parse-server/master/.github/parse-server-logo.png';
    const file1 = new Parse.File('parse-server-logo', { uri: parseLogo });
    await file1.save();

    const object = new Parse.Object('TestObject');
    object.set('file1', file1);
    await object.save();

    const query = new Parse.Query('TestObject');
    let result = await query.get(object.id);

    assert.equal(file1.name(), result.get('file1').name());
    assert.equal(file1.url(), result.get('file1').url());

    // Try http
    const file2 = new Parse.File('parse-server-logo', { uri: file1.url() });
    await file2.save();

    object.set('file2', file2);
    await object.save();

    result = await query.get(object.id);
    assert.equal(file2.url(), result.get('file2').url());
  });
});
