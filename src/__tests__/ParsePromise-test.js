/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();

var ParsePromise = require('../ParsePromise');

var asyncHelper = require('./test_helpers/asyncHelper');

describe('Promise', () => {
  it('can disable A+ compliance', () => {
    ParsePromise.disableAPlusCompliant();
    expect(ParsePromise.isPromisesAPlusCompliant()).toBe(false);
  });

  it('can enable A+ compliance', () => {
    ParsePromise.enableAPlusCompliant();
    expect(ParsePromise.isPromisesAPlusCompliant()).toBe(true);
  });
});

function promiseTests() {
  it('can be initially resolved', () => {
    var promise = ParsePromise.as('foo');
    promise.then((result) => {
      expect(result).toBe('foo');
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
    });
  });

  it('can be initially resolved with multiple values', () => {
    var promise = ParsePromise.as('foo', 'bar');
    promise.then((result1, result2) => {
      expect(result1).toBe('foo');
      expect(result2).toBe('bar');
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
    });
  });

  it('can be initially rejected', () => {
    var promise = ParsePromise.error('foo', 'bar');
    promise.then((result) => {
      // This should not be reached
      expect(true).toBe(false);
    }, (error, unused) => {
      expect(error).toBe('foo');
      expect(unused).toBe(undefined);
    });
  });

  it('can be resolved later', asyncHelper(function(done) {
    var promise = new ParsePromise();
    promise.then((result) => {
      expect(result).toBe('bar');
      done();
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
      done();
    });

    setTimeout(() => { promise.resolve('bar'); }, 10);
    jest.runAllTimers();
  }));

  it('can be resolved with multiple values later', asyncHelper(function(done) {
    var promise = new ParsePromise();
    promise.then((result1, result2) => {
      expect(result1).toBe('bar');
      expect(result2).toBe('baz');
      done();
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
      done();
    });

    setTimeout(() => { promise.resolve('bar', 'baz'); }, 10);
    jest.runAllTimers();
  }));

  it('can be rejected later', asyncHelper(function(done) {
    var promise = new ParsePromise();
    promise.then((result) => {
      // This should not be reached
      expect(true).toBe(false);
      done();
    }, (error) => {
      expect(error).toBe('bar');
      done();
    });

    setTimeout(() => { promise.reject('bar'); }, 10);
    jest.runAllTimers();
  }));

  it('can resolve with a constant and then resolve', asyncHelper(function(done) {
    var promise = new ParsePromise();
    promise.then((result) => {
      expect(result).toBe('foo');
      return 'bar';
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
    }).then((result) => {
      expect(result).toBe('bar');
      done();
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
      done();
    });

    setTimeout(() => { promise.resolve('foo'); }, 10);
    jest.runAllTimers();
  }));

  it('can reject with a constant and then resolve', asyncHelper(function(done) {
    var promise = new ParsePromise();
    promise.then((result) => {
      // This should not be reached
      expect(true).toBe(false);
    }, (error) => {
      expect(error).toBe('foo');
      return 'bar';
    }).then((result) => {
      if (ParsePromise.isPromisesAPlusCompliant()) {
        expect(result).toBe('bar');
      } else {
        // Errors remain errors in jQuery-style Promises
        expect(true).toBe(false);
      }
      done();
    }, (error) => {
      if (ParsePromise.isPromisesAPlusCompliant()) {
        // In Promises/A+l, errors are handled
        expect(true).toBe(false);
      } else {
        expect(error).toBe('bar');
      }
      done();
    });

    setTimeout(() => { promise.reject('foo'); }, 10);
    jest.runAllTimers();
  }));

  it('can resolve with a promise and then resolve', asyncHelper(function(done) {
    var promise = new ParsePromise();
    promise.then((result) => {
      expect(result).toBe('foo');
      return ParsePromise.as('bar');
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
    }).then((result) => {
      expect(result).toBe('bar');
      done();
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
      done();
    });

    setTimeout(() => { promise.resolve('foo'); }, 10);
    jest.runAllTimers();
  }));

  it('can reject with a promise and then resolve', asyncHelper(function(done) {
    var promise = new ParsePromise();
    promise.then((result) => {
      // This should not be reached
      expect(true).toBe(false);
    }, (error) => {
      expect(error).toBe('foo');
      return ParsePromise.as('bar');
    }).then((result) => {
      expect(result).toBe('bar');
      done();
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
      done();
    });

    setTimeout(() => { promise.reject('foo'); }, 10);
    jest.runAllTimers();
  }));

  it('can resolve with a promise and then reject', asyncHelper(function(done) {
    var promise = new ParsePromise();
    promise.then((result) => {
      expect(result).toBe('foo');
      return ParsePromise.error('bar');
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
    }).then((result) => {
      // This should not be reached
      expect(true).toBe(false);
      done();
    }, (error) => {
      expect(error).toBe('bar');
      done();
    });

    setTimeout(() => { promise.resolve('foo'); }, 10);
    jest.runAllTimers();
  }));

  it('can reject with a promise and then reject', asyncHelper(function(done) {
    var promise = new ParsePromise();
    promise.then((result) => {
      // This should not be reached
      expect(true).toBe(false);
    }, (error) => {
      expect(error).toBe('foo');
      return ParsePromise.error('bar');
    }).then((result) => {
      // This should not be reached
      expect(true).toBe(false);
      done();
    }, (error) => {
      expect(error).toBe('bar');
      done();
    });

    setTimeout(() => { promise.reject('foo'); }, 10);
    jest.runAllTimers();
  }));

  it('can handle promises in parallel with array', asyncHelper(function(done) {
    var COUNT = 5;

    var delay = function(ms) {
      var promise = new ParsePromise();
      setTimeout(() => { promise.resolve(); }, ms);
      return promise;
    };

    var called = 0;
    var promises = [];
    function generate(i) {
      promises[i] = delay((i % 2) ? (i * 10) : (COUNT * 10) - (i * 10)).then(
        function() {
          called++;
          return 5 * i;
        });
    }
    for (var i = 0; i < COUNT; i++) {
      generate(i);
    }

    ParsePromise.when(promises).then(function(results) {
      expect(called).toBe(COUNT);
      expect(COUNT).toBe(results.length);
      var actual = results;
      for (var i = 0; i < actual.length; i++) {
        expect(actual[i]).toBe(5 * i);
      }
      done();
    });

    jest.runAllTimers();
  }));

  it('can handle promises in parallel with arguments', asyncHelper(function(done) {
    var COUNT = 5;

    var delay = function(ms) {
      var promise = new ParsePromise();
      setTimeout(() => { promise.resolve(); }, ms);
      return promise;
    };

    var called = 0;
    var promises = [];
    function generate(i) {
      promises[i] = delay((i % 2) ? (i * 10) : (COUNT * 10) - (i * 10)).then(
        function() {
          called++;
          return 5 * i;
        });
    }
    for (var i = 0; i < COUNT; i++) {
      generate(i);
    }

    ParsePromise.when.apply(null, promises).then(function() {
      expect(called).toBe(COUNT);
      expect(COUNT).toBe(arguments.length);
      var actual = arguments;
      for (var i = 0; i < actual.length; i++) {
        expect(actual[i]).toBe(5 * i);
      }
      done();
    });

    jest.runAllTimers();
  }));

  it('immediately resolves when processing an empty array in parallel', asyncHelper((done) => {
    ParsePromise.when([]).then((result) => {
      expect(result).toEqual([]);
      done();
    });
  }));

  it('can handle rejected promises in parallel', asyncHelper((done) => {
    ParsePromise.when([ParsePromise.as(1), ParsePromise.error('an error')]).then(null, (errors) => {
      expect(errors).toEqual([undefined, 'an error']);
      done();
    });
  }));

  it('can automatically resolve non-promises in parallel', asyncHelper((done) => {
    ParsePromise.when([1,2,3]).then((results) => {
      expect(results).toEqual([1,2,3]);
      done();
    });
  }));

  it('passes on errors', () => {
    ParsePromise.error('foo').then(() => {
      // This should not be reached
      expect(true).toBe(false);
    }).then(() => {
      // This should not be reached
      expect(true).toBe(false);
    }).then(() => {
      // This should not be reached
      expect(true).toBe(false);
    }, (error) => {
      expect(error).toBe('foo');
      return ParsePromise.error('bar');
    }).then(() => {
      // This should not be reached
      expect(true).toBe(false);
    }).then(() => {
      // This should not be reached
      expect(true).toBe(false);
    }, (error) => {
      expect(error).toBe('bar');
      return 'okay';
    }).then((result) => {
      if (ParsePromise.isPromisesAPlusCompliant()) {
        expect(result).toBe('okay');
      } else {
        // This should not be reached
        expect(true).toBe(false);
      }
    }, (error) => {
      if (ParsePromise.isPromisesAPlusCompliant()) {
        // This should not be reached
        expect(true).toBe(false);
      } else {
        expect(error).toBe('okay');
      }
    });
  });

  it('runs an always method when resolved', () => {
    var promise = ParsePromise.as('foo');
    promise.always((result) => {
      expect(result).toBe('foo');
    }).then((result) => {
      expect(result).toBe(undefined);
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
    });
  });

  it('runs an always method when rejected', () => {
    var promise = ParsePromise.error('foo');
    promise.always((error) => {
      expect(error).toBe('foo');
    }).then((result) => {
      if (ParsePromise.isPromisesAPlusCompliant()) {
        expect(result).toBe(undefined);
      } else {
        // This should not be reached
        expect(true).toBe(false);
      }
    }, (error) => {
      if (ParsePromise.isPromisesAPlusCompliant()) {
        // This should not be reached
        expect(true).toBe(false);
      } else {
        expect(error).toBe(undefined);
      }
    });
  });

  it('runs done callbacks on success', () => {
    var promise = ParsePromise.as('foo');
    promise.done((result) => {
      expect(result).toBe('foo');
    }).then(function(result) {
      expect(result).toBe(undefined);
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
    });
  });

  it('does not run done callbacks on error', () => {
    var promise = ParsePromise.error('foo');
    promise.done((result) => {
      // This should not be reached
      expect(true).toBe(false);
    }).then((result) => {
      // This should not be reached
      expect(true).toBe(false);
    }, (error) => {
      expect(error).toBe('foo');
    });
  });

  it('runs fail callbacks on error', () => {
    var promise = ParsePromise.error('foo');
    promise.fail((error) => {
      expect(error).toBe('foo');
    }).then((result) => {
      if (ParsePromise.isPromisesAPlusCompliant()) {
        expect(result).toBe(undefined);
      } else {
        // This should not be reached
        expect(true).toBe(false);
      }
    }, (error) => {
      if (ParsePromise.isPromisesAPlusCompliant()) {
        // This should not be reached
        expect(true).toBe(false);
      } else {
        expect(error).toBe(undefined);
      }
    });
  });

  it('does not run fail callbacks on success', () => {
    var promise = ParsePromise.as('foo');
    promise.fail((error) => {
      // This should not be reached
      expect(true).toBe(false);
    }).then((result) => {
      expect(result).toBe('foo');
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
    });
  });

  it('runs catch callbacks on error', () => {
    var promise = ParsePromise.error('foo');
    promise.fail((error) => {
      expect(error).toBe('foo');
    }).then((result) => {
      if (ParsePromise.isPromisesAPlusCompliant()) {
        expect(result).toBe(undefined);
      } else {
        // This should not be reached
        expect(true).toBe(false);
      }
    }, (error) => {
      if (ParsePromise.isPromisesAPlusCompliant()) {
        // This should not be reached
        expect(true).toBe(false);
      } else {
        expect(error).toBe(undefined);
      }
    });
  });

  it('does not run catch callbacks on success', () => {
    var promise = ParsePromise.as('foo');
    promise.catch((error) => {
      // This should not be reached
      expect(true).toBe(false);
    }).then((result) => {
      expect(result).toBe('foo');
    }, (error) => {
      // This should not be reached
      expect(true).toBe(false);
    });
  });

  it('operates asynchonously', () => {
    var triggered = false;
    ParsePromise.as().then(() => {
      triggered = true;
    });
    if (ParsePromise.isPromisesAPlusCompliant()) {
      // In Promises/A+, callbacks shouldn't run immediately
      expect(triggered).toBe(false);
    } else {
      // In jQuery style, callbacks run immediately
      expect(triggered).toBe(true);
    }
  });

  it('catches exceptions', () => {
    if (!ParsePromise.isPromisesAPlusCompliant()) {
      // jQuery semantics are to not catch exceptions
      return;
    }

    ParsePromise.as().then(() => {
      throw 'hello';
    }).then(() => {
      // This should not be reached
      expect(true).toBe(false);
    }, (error) => {
      expect(error).toBe('hello');
    });
  });

  it('can check if an object is a thenable promise', () => {
    expect(ParsePromise.is(null)).toBe(false);
    expect(ParsePromise.is(void(0))).toBe(false);
    expect(ParsePromise.is('a string')).toBe(false);
    expect(ParsePromise.is({})).toBe(false);
    expect(ParsePromise.is(ParsePromise.as())).toBe(true);
    expect(ParsePromise.is(ParsePromise.error())).toBe(true);
  });

  it('can be constructed in ES6 style and resolved', asyncHelper((done) => {
    expect(ParsePromise.length).toBe(1); // constructor arguments

    new ParsePromise((resolve, reject) => {
      resolve('abc');
    }).then((result) => {
      expect(result).toBe('abc');
      
      return new ParsePromise((resolve, reject) => {
        resolve('def');
      });
    }).then((result) => {
      expect(result).toBe('def');
      done();
    });
  }));

  it('can be constructed in ES6 style and rejected', asyncHelper((done) => {
    new ParsePromise((resolve, reject) => {
      reject('err');
    }).then(() => {
      // Should not be reached
    }, (error) => {
      expect(error).toBe('err');
      
      return new ParsePromise((resolve, reject) => {
        reject('err2');
      });
    }).then(null, (error) => {
      expect(error).toBe('err2');
      done();
    });
  }));

  it('can be initially resolved, ES6 style', asyncHelper((done) => {
    ParsePromise.resolve('abc').then((result) => {
      expect(result).toBe('abc');
      
      return ParsePromise.resolve(ParsePromise.as('def'));
    }).then((result) => {
      expect(result).toBe('def');
      done();
    });
  }));

  it('can be initially rejected, ES6 style', asyncHelper((done) => {
    ParsePromise.reject('err').then(null, (error) => {
      expect(error).toBe('err');
      done();
    });
  }));

  it('resolves Promise.all with the set of resolved results', asyncHelper((done) => {
    let firstSet = [
      new ParsePromise(),
      new ParsePromise(),
      new ParsePromise(),
      new ParsePromise()
    ];

    let secondSet = [5,6,7];

    ParsePromise.all([]).then((results) => {
      expect(results).toEqual([]);

      return ParsePromise.all(firstSet);
    }).then((results) => {
      expect(results).toEqual([1,2,3,4]);
      return ParsePromise.all(secondSet);
    }).then((results) => {
      expect(results).toEqual([5,6,7]);
      done();
    });
    firstSet[0].resolve(1);
    firstSet[1].resolve(2);
    firstSet[2].resolve(3);
    firstSet[3].resolve(4);
  }));

  it('rejects Promise.all with the first rejected promise', asyncHelper((done) => {
    let promises = [
      new ParsePromise(),
      new ParsePromise(),
      new ParsePromise()
    ];

    ParsePromise.all(promises).then(() => {
      // this should not be reached
    }, (error) => {
      expect(error).toBe('an error');
      done();
    });
    promises[0].resolve(1);
    promises[1].reject('an error');
    promises[2].resolve(3);
  }));

  it('resolves Promise.race with the first resolved result', asyncHelper((done) => {
    let firstSet = [
      new ParsePromise(),
      new ParsePromise(),
      new ParsePromise()
    ];

    let secondSet = [4, 5, ParsePromise.error()];

    ParsePromise.race(firstSet).then((result) => {
      expect(result).toBe(2);

      return ParsePromise.race(secondSet);
    }).then((result) => {
      expect(result).toBe(4);
      done();
    });
    firstSet[1].resolve(2);
    firstSet[0].resolve(1);
  }));

  it('rejects Promise.race with the first rejected reason', asyncHelper((done) => {
    let promises = [
      new ParsePromise(),
      new ParsePromise(),
      new ParsePromise()
    ];

    ParsePromise.race(promises).fail((error) => {
      expect(error).toBe('error 2');
      done();
    });
    promises[1].reject('error 2');
    promises[0].resolve('error 1');
  }));

  it('can implement continuations', asyncHelper((done) => {
    let count = 0;
    let loop = () => {
      count++;
      return ParsePromise.as();
    }
    ParsePromise._continueWhile(
      () => { return count < 5 },
      loop
    ).then(() => {
      expect(count).toBe(5);
      done();
    });
  }));

  it('can attach a universal callback to a promise', asyncHelper((done) => {
    ParsePromise.as(15)._continueWith((result, err) => {
      expect(result).toEqual([15]);
      expect(err).toBe(null);

      ParsePromise.error('an error')._continueWith((result, err) => {
        expect(result).toBe(null);
        expect(err).toBe('an error');

        done();
      });
    });
  }));
}

describe('Promise (A Compliant)', () => {
  beforeEach(() => {
    ParsePromise.disableAPlusCompliant();
  });

  promiseTests();
});

describe('Promise (A+ Compliant)', () => {
  beforeEach(() => {
    ParsePromise.enableAPlusCompliant();
  });

  promiseTests();
});
