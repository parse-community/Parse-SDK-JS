'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

function testConfig() {
  return Parse.Config.save(
    { internal: "i", public: "p" },
    { internal: true }
  );
}

describe('Parse Config', () => {
  beforeEach((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => {
      done();
    });
  });

  it('can create a config', async () => {
    const config = await Parse.Config.save({
      str: 'hello',
      num: 42
    });
    assert.equal(config.get('str'), 'hello');
    assert.equal(config.get('num'), 42);
  });

  it('can get a config', async () => {
    await Parse.Config.save({
      str: 'hello',
      num: 42
    });
    const config = await Parse.Config.get();
    assert.equal(config.get('str'), 'hello');
    assert.equal(config.get('num'), 42);
  });

  it('can get internal config parameter with masterkey', async () => {
    await testConfig();

    const config = await Parse.Config.get({ useMasterKey: true });
    assert.equal(config.get('internal'), 'i');
    assert.equal(config.get('public'), 'p');
  });

  it('cannot get internal config parameter without masterkey', async () => {
    await testConfig();

    const config = await Parse.Config.get();
    assert.equal(config.get('internal'), undefined);
    assert.equal(config.get('public'), 'p');
  });
});
