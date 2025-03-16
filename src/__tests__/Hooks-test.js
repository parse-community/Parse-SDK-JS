jest.dontMock('../ParseHooks');
jest.dontMock('../CoreManager');
jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../ParseError');
jest.dontMock('../ParseObject');
jest.dontMock('../RESTController');

const Hooks = require('../ParseHooks');
const CoreManager = require('../CoreManager').default;
const RESTController = require('../RESTController').default;

const defaultController = CoreManager.getHooksController();
const { sendRequest } = defaultController;

CoreManager.setInstallationController({
  currentInstallationId() {
    return Promise.resolve('iid');
  },
  currentInstallation() {},
  updateInstallationOnDisk() {},
});
CoreManager.set('APPLICATION_ID', 'A');
CoreManager.set('JAVASCRIPT_KEY', 'B');
CoreManager.set('MASTER_KEY', 'C');
CoreManager.set('VERSION', 'V');

describe('Hooks', () => {
  beforeEach(() => {
    const run = jest.fn();
    run.mockReturnValue(
      Promise.resolve({
        result: {},
      })
    );
    const ajax = jest.fn();
    ajax.mockReturnValue(
      Promise.resolve({
        response: {},
      })
    );
    RESTController.ajax = ajax;
    defaultController.sendRequest = run;
    CoreManager.setHooksController(defaultController);
    CoreManager.setRESTController(RESTController);
  });

  it('should properly build GET functions', async () => {
    Hooks.getFunctions();

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'GET',
      'hooks/functions',
    ]);
    defaultController.sendRequest = sendRequest;
    await Hooks.getFunctions();
    expect(RESTController.ajax.mock.calls[0][1]).toBe('https://api.parse.com/1/hooks/functions');
  });

  it('should properly build GET triggers', async () => {
    Hooks.getTriggers();

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'GET',
      'hooks/triggers',
    ]);
    defaultController.sendRequest = sendRequest;
    await Hooks.getTriggers();
    expect(RESTController.ajax.mock.calls[0][1]).toBe('https://api.parse.com/1/hooks/triggers');
  });

  it('should properly build GET function', async () => {
    Hooks.getFunction('functionName');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'GET',
      'hooks/functions/functionName',
    ]);
    defaultController.sendRequest = sendRequest;
    await Hooks.getFunction('functionName');
    expect(RESTController.ajax.mock.calls[0][1]).toBe(
      'https://api.parse.com/1/hooks/functions/functionName'
    );
  });

  it('should properly build GET trigger', async () => {
    Hooks.getTrigger('MyClass', 'beforeSave');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'GET',
      'hooks/triggers/MyClass/beforeSave',
    ]);
    defaultController.sendRequest = sendRequest;
    await Hooks.getTrigger('MyClass', 'beforeSave');
    expect(RESTController.ajax.mock.calls[0][1]).toBe(
      'https://api.parse.com/1/hooks/triggers/MyClass/beforeSave'
    );
  });

  it('should properly build POST function', async () => {
    Hooks.createFunction('myFunction', 'https://example.com');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'POST',
      'hooks/functions',
      {
        functionName: 'myFunction',
        url: 'https://example.com',
      },
    ]);
    defaultController.sendRequest = sendRequest;
    await Hooks.createFunction('myFunction', 'https://example.com');
    expect(RESTController.ajax.mock.calls[0][1]).toBe('https://api.parse.com/1/hooks/functions');
  });

  it('should properly build POST trigger', async () => {
    Hooks.createTrigger('MyClass', 'beforeSave', 'https://example.com');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'POST',
      'hooks/triggers',
      {
        className: 'MyClass',
        triggerName: 'beforeSave',
        url: 'https://example.com',
      },
    ]);
    defaultController.sendRequest = sendRequest;
    await Hooks.createTrigger('MyClass', 'beforeSave', 'https://example.com');
    expect(RESTController.ajax.mock.calls[0][1]).toBe('https://api.parse.com/1/hooks/triggers');
  });

  it('should properly build PUT function', async () => {
    Hooks.updateFunction('myFunction', 'https://example.com');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'PUT',
      'hooks/functions/myFunction',
      {
        url: 'https://example.com',
      },
    ]);
    defaultController.sendRequest = sendRequest;
    await Hooks.updateFunction('myFunction', 'https://example.com');
    expect(RESTController.ajax.mock.calls[0][1]).toBe(
      'https://api.parse.com/1/hooks/functions/myFunction'
    );
  });

  it('should properly build PUT trigger', async () => {
    Hooks.updateTrigger('MyClass', 'beforeSave', 'https://example.com');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'PUT',
      'hooks/triggers/MyClass/beforeSave',
      {
        url: 'https://example.com',
      },
    ]);
    defaultController.sendRequest = sendRequest;
    await Hooks.updateTrigger('MyClass', 'beforeSave', 'https://example.com');
    expect(RESTController.ajax.mock.calls[0][1]).toBe(
      'https://api.parse.com/1/hooks/triggers/MyClass/beforeSave'
    );
  });

  it('should properly build removeFunction', async () => {
    Hooks.removeFunction('myFunction');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'PUT',
      'hooks/functions/myFunction',
      { __op: 'Delete' },
    ]);

    defaultController.sendRequest = sendRequest;
    await Hooks.removeFunction('myFunction');
    expect(RESTController.ajax.mock.calls[0][1]).toBe(
      'https://api.parse.com/1/hooks/functions/myFunction'
    );
  });

  it('should properly build removeTrigger', async () => {
    Hooks.removeTrigger('MyClass', 'beforeSave');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'PUT',
      'hooks/triggers/MyClass/beforeSave',
      { __op: 'Delete' },
    ]);
    defaultController.sendRequest = sendRequest;
    await Hooks.removeTrigger('MyClass', 'beforeSave');
    expect(RESTController.ajax.mock.calls[0][1]).toBe(
      'https://api.parse.com/1/hooks/triggers/MyClass/beforeSave'
    );
  });

  it('should throw invalid create', async () => {
    expect.assertions(10);
    const p1 = Hooks.create({ functionName: 'myFunction' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p2 = Hooks.create({ url: 'http://example.com' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p3 = Hooks.create({ className: 'MyClass' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p4 = Hooks.create({ className: 'MyClass', url: 'http://example.com' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p5 = Hooks.create({ className: 'MyClass', triggerName: 'beforeSave' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    await Promise.all([p1, p2, p3, p4, p5]);
  });

  it('should throw invalid update', async () => {
    expect.assertions(6);
    const p1 = Hooks.update({ functionssName: 'myFunction' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p2 = Hooks.update({ className: 'MyClass' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p3 = Hooks.update({ className: 'MyClass', url: 'http://example.com' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });
    await Promise.all([p1, p2, p3]);
  });

  it('should throw invalid remove', async () => {
    expect.assertions(6);
    const p1 = Hooks.remove({ functionssName: 'myFunction' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p2 = Hooks.remove({ className: 'MyClass' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p3 = Hooks.remove({ className: 'MyClass', url: 'http://example.com' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    await Promise.all([p1, p2, p3]);
  });

  it('should sendRequest', async () => {
    defaultController.sendRequest = sendRequest;
    const request = function () {
      return Promise.resolve(12);
    };
    CoreManager.setRESTController({ request, ajax: jest.fn() });
    const decoded = await defaultController.sendRequest('POST', 'hooks/triggers/myhook');
    expect(decoded).toBe(12);
  });

  it('handle sendRequest error', async () => {
    defaultController.sendRequest = sendRequest;
    const request = function () {
      return Promise.resolve(undefined);
    };
    CoreManager.setRESTController({ request, ajax: jest.fn() });
    try {
      await defaultController.sendRequest('POST', 'hooks/triggers/myhook');
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toBe('The server returned an invalid response.');
    }
  });
});
