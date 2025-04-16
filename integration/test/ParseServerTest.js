'use strict';

describe('ParseServer', () => {
  it('can reconfigure server', async () => {
    let parseServer = await reconfigureServer({ serverURL: 'www.google.com' });
    expect(parseServer.config.serverURL).toBe('www.google.com');

    await shutdownServer(parseServer);

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
    // Open a connection to the server
    const query = new Parse.Query(TestObject);
    await query.subscribe();
    expect(openConnections.size > 0).toBeTruthy();

    await shutdownServer(parseServer);
    expect(close).toBe(1);
    expect(openConnections.size).toBe(0);

    await expectAsync(object.save()).toBeRejectedWithError(
      'XMLHttpRequest failed: "Unable to connect to the Parse API"'
    );
    await reconfigureServer({});
    await object.save();
    expect(object.id).toBeDefined();
  });
});
