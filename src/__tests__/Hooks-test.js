/**
* Copyright (c) 2015-present, Parse, LLC.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree. An additional grant
* of patent rights can be found in the PATENTS file in the same directory.
*/

jest.dontMock('../ParseHooks');
jest.dontMock('../CoreManager');
jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../ParsePromise');

var Hooks = require('../ParseHooks');
var CoreManager = require('../CoreManager');
var ParsePromise = require('../ParsePromise');

var defaultController = CoreManager.getHooksController();

describe('Hooks', () => {
  beforeEach(() => {
    var run = jest.genMockFunction();
    run.mockReturnValue(ParsePromise.as({
      result: {}
    }));
    defaultController.sendRequest = run;
    CoreManager.setHooksController(defaultController);
  });

  it('shoud properly build GET functions', () => {
    Hooks.getFunctions();

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0])
    .toEqual(['GET', '/hooks/functions']);
  });

  it('shoud properly build GET triggers', () => {
    Hooks.getTriggers();

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0])
    .toEqual(['GET', '/hooks/triggers']);
  })

  it('shoud properly build GET function', () => {
    Hooks.getFunction('functionName');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0])
    .toEqual(['GET', '/hooks/functions/functionName']);
  })

  it('shoud properly build GET trigger', () => {
    Hooks.getTrigger('MyClass', 'beforeSave');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0])
    .toEqual(['GET', '/hooks/triggers/MyClass/beforeSave']);
  })

  it('shoud properly build POST function', () => {
    Hooks.createFunction('myFunction', 'https://dummy.com');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0])
    .toEqual(['POST', '/hooks/functions', {
      functionName: 'myFunction',
      url: 'https://dummy.com'
    }]);
  })

  it('shoud properly build POST trigger', () => {
    Hooks.createTrigger('MyClass', 'beforeSave', 'https://dummy.com');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0])
    .toEqual(['POST', '/hooks/triggers', {
      className: 'MyClass',
      triggerName: 'beforeSave',
      url: 'https://dummy.com'
    }]);
  })

  it('shoud properly build PUT function', () => {
    Hooks.updateFunction('myFunction', 'https://dummy.com');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0])
    .toEqual(['PUT', '/hooks/functions/myFunction', {
      url: 'https://dummy.com'
    }]);
  })

  it('shoud properly build PUT trigger', () => {
    Hooks.updateTrigger('MyClass', 'beforeSave', 'https://dummy.com');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0])
    .toEqual(['PUT', '/hooks/triggers/MyClass/beforeSave', {
      url: 'https://dummy.com'
    }]);
  })


  it('shoud properly build removeFunction', () => {
    Hooks.removeFunction('myFunction');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0])
    .toEqual(['PUT', '/hooks/functions/myFunction', { "__op": "Delete" }]);
  })

  it('shoud properly build removeTrigger', () => {
    Hooks.removeTrigger('MyClass', 'beforeSave');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0])
    .toEqual(['PUT', '/hooks/triggers/MyClass/beforeSave', { "__op": "Delete" }]);
  })

  it('shoud throw invalid create', () => {
    Hooks.create({functionName: 'myFunction'}).then(() => {
      fail('should not succeed')
    }).catch((err) => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    Hooks.create({url: 'http://dummy.com'}).then(() => {
      fail('should not succeed')
    }).catch((err) => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    Hooks.create({className: 'MyClass'}).then(() => {
      fail('should not succeed')
    }).catch((err) => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    Hooks.create({className: 'MyClass', url: 'http://dummy.com'}).then(() => {
      fail('should not succeed')
    }).catch((err) => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    Hooks.create({className: 'MyClass', triggerName: 'beforeSave'}).then(() => {
      fail('should not succeed')
    }).catch((err) => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });
  })

  it('shoud throw invalid update', () => {
    Hooks.update({functionssName: 'myFunction'}).then(() => {
      fail('should not succeed')
    }).catch((err) => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    Hooks.update({className: 'MyClass'}).then(() => {
      fail('should not succeed')
    }).catch((err) => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    Hooks.update({className: 'MyClass', url: 'http://dummy.com'}).then(() => {
      fail('should not succeed')
    }).catch((err) => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });
  })

  it('shoud throw invalid remove', () => {
    Hooks.remove({functionssName: 'myFunction'}).then(() => {
      fail('should not succeed')
    }).catch((err) => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    Hooks.remove({className: 'MyClass'}).then(() => {
      fail('should not succeed')
    }).catch((err) => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    Hooks.remove({className: 'MyClass', url: 'http://dummy.com'}).then(() => {
      fail('should not succeed')
    }).catch((err) => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });
  })


});
