'use strict';

describe('ParseServer', () => {
  it('can reconfigure server', async () => {
    let parseServer = await reconfigureServer({ serverURL: 'www.google.com' });
    expect(parseServer.config.serverURL).toBe('www.google.com');
    await parseServer.handleShutdown();
    parseServer = await reconfigureServer();
    expect(parseServer.config.serverURL).toBe('http://localhost:1337/parse');
  });

  it('can shutdown', async () => {
    let close = 0;
    const parseServer = await reconfigureServer();
    parseServer.server.on('close', () => {
      close += 1;
    });
    const object = new TestObject({ foo: 'bar' });
    await parseServer.handleShutdown();
    expect(close).toBe(1);
    await expectAsync(object.save()).toBeRejectedWithError(
      'XMLHttpRequest failed: "Unable to connect to the Parse API"'
    );
    await reconfigureServer({});
    await object.save();
    expect(object.id).toBeDefined();
  });
});
