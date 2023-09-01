'use strict';

const assert = require('assert');
const Parse = require('../../node');

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
    await expectAsync(object.save()).toBeRejectedWithError('The connection to the Parse servers failed.');
    await reconfigureServer({});
    await object.save();
    assert(object.id);
  });

  it('can shutdown with custom message', async () => {
    const defaultMessage = Parse.CoreManager.get('CONNECTION_FAILED_MESSAGE');
    const message = 'Server is down!';
    Parse.CoreManager.set('CONNECTION_FAILED_MESSAGE', message);
    const parseServer = await reconfigureServer();
    const object = new TestObject({ foo: 'bar' });
    await parseServer.handleShutdown();
    await new Promise((resolve) => parseServer.server.close(resolve));
    await expectAsync(object.save()).toBeRejectedWithError(message);
    await reconfigureServer({});
    await object.save();
    assert(object.id);
    Parse.CoreManager.set('CONNECTION_FAILED_MESSAGE', defaultMessage);
  });
});
