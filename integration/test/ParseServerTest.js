'use strict';

const assert = require('assert');

describe('ParseServer', () => {
  it('can reconfigure server', async () => {
    const parseServer = await reconfigureServer({ serverURL: 'www.google.com' });
    assert.strictEqual(parseServer.config.serverURL, 'www.google.com');
    await new Promise((resolve) => parseServer.server.close(resolve));
    await reconfigureServer();
  });

  it('can shutdown', async () => {
    const parseServer = await reconfigureServer();
    const object = new TestObject({ foo: 'bar' });
    await parseServer.handleShutdown();
    await new Promise((resolve) => parseServer.server.close(resolve));
    await expectAsync(object.save()).toBeRejectedWithError('XMLHttpRequest failed: "Unable to connect to the Parse API"');
    await reconfigureServer({});
    await object.save();
    assert(object.id);
  });
});
