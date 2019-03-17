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
    const parseLogo = 'https://raw.githubusercontent.com/parse-community/parse-server/master/.github/parse-server-logo.png';
    const file = new Parse.File('parse-server-logo', { uri: parseLogo });
    await file.save();

    const object = new Parse.Object('TestObject');
    object.set('file', file);
    await object.save();

    const query = new Parse.Query('TestObject');
    const result = await query.get(object.id);

    assert.equal(file.name(), result.get('file').name());
    assert.equal(file.url(), result.get('file').url());
  });
});
