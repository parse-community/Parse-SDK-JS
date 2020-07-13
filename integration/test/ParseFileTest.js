'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

describe('Parse.File', () => {
  beforeEach((done) => {
    Parse.initialize('integration', null, 'notsosecret');
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

  it('can cancel save file with uri', async () => {
    const parseLogo = 'https://raw.githubusercontent.com/parse-community/parse-server/master/.github/parse-server-logo.png';
    const file = new Parse.File('parse-server-logo', { uri: parseLogo });
    file.save().then(() => {
      assert.equal(file.name(), undefined);
      assert.equal(file.url(), undefined);
    });
    file.cancel();
  });

  it('can not get data from unsaved file', async () => {
    const file = new Parse.File('parse-server-logo', [61, 170, 236, 120]);
    file._data = null;
    try {
      await file.getData();
    } catch (e) {
      assert.equal(e.message, 'Cannot retrieve data for unsaved ParseFile.');
    }
  });

  it('can get file data from byte array', async () => {
    const file = new Parse.File('parse-server-logo', [61, 170, 236, 120]);
    let data = await file.getData();
    assert.equal(data, 'ParseA==');
    file._data = null;
    await file.save();
    assert.equal(file._data, null)
    data = await file.getData();
    assert.equal(data, 'ParseA==');
  });

  it('can get file data from base64', async () => {
    const file = new Parse.File('parse-server-logo', { base64: 'ParseA==' });
    let data = await file.getData();
    assert.equal(data, 'ParseA==');
    file._data = null;
    await file.save();
    assert.equal(file._data, null)
    data = await file.getData();
    assert.equal(data, 'ParseA==');
  });

  it('can get file data from full base64', async () => {
    const file = new Parse.File('parse-server-logo', { base64: 'data:image/jpeg;base64,ParseA==' });
    let data = await file.getData();
    assert.equal(data, 'ParseA==');
    file._data = null;
    await file.save();
    assert.equal(file._data, null)
    data = await file.getData();
    assert.equal(data, 'ParseA==');
  });

  it('can delete file', async () => {
    const parseLogo = 'https://raw.githubusercontent.com/parse-community/parse-server/master/.github/parse-server-logo.png';
    const file = new Parse.File('parse-server-logo', { uri: parseLogo });
    await file.save();
    const data = await file.getData();

    const deletedFile = await file.destroy();
    const deletedData = await file.getData();
    assert.equal(file, deletedFile);
    assert.notEqual(data, deletedData);
  });

  it('can handle delete file error', async () => {
    const parseLogo = 'https://raw.githubusercontent.com/parse-community/parse-server/master/.github/parse-server-logo.png';
    const file = new Parse.File('parse-server-logo', { uri: parseLogo });
    try {
      await file.destroy();
      assert.equal(false, true);
    } catch (e) {
      assert.equal(e.code, Parse.Error.FILE_DELETE_ERROR);
    }
  });
});
