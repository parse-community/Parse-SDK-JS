'use strict';

const assert = require('assert');

describe('ParseServer', () => {
  it('can reconfigure server', async done => {
    const parseServer = await reconfigureServer({ serverURL: 'www.google.com' });
    assert.strictEqual(parseServer.config.serverURL, 'www.google.com');
    parseServer.server.close(async () => {
      await reconfigureServer();
      done();
    });
  });

  it('can shutdown', async done => {
    const parseServer = await reconfigureServer();
    const object = new TestObject({ foo: 'bar' });
    await parseServer.handleShutdown();
    parseServer.server.close(async () => {
      try {
        await object.save();
      } catch (e) {
        assert.strictEqual(
          e.message,
          'XMLHttpRequest failed: "Unable to connect to the Parse API"'
        );
        await reconfigureServer({});
        await object.save();
        assert(object.id);
        done();
      }
    });
  });
});
