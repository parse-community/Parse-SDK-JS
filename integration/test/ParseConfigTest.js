'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

function testConfig() {
  return Parse.Config.save(
    { internal: "i", string: "s", number: 12 },
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
    const config = await testConfig();

    assert.notStrictEqual(config, undefined);
    assert.strictEqual(config.get('string'), 's');
    assert.strictEqual(config.get('internal'), 'i');
    assert.strictEqual(config.get('number'), 12);
  });

  it('can get a config', async () => {
    await testConfig();

    const config = await Parse.Config.get();
    assert.notStrictEqual(config, undefined);
    assert.strictEqual(config.get('string'), 's');
    assert.strictEqual(config.get('number'), 12);
  });

  it('can get internal config parameter with masterkey', async () => {
    await testConfig();

    const config = await Parse.Config.get({ useMasterKey: true });
    assert.equal(config.get('internal'), 'i');
    assert.equal(config.get('string'), 's');
  });

  it('cannot get internal config parameter without masterkey', async () => {
    await testConfig();

    const config = await Parse.Config.get();
    assert.equal(config.get('internal'), undefined);
    assert.equal(config.get('string'), 's');
  });
});
