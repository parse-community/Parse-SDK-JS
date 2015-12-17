/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var isPromisesAPlusCompliant = false;

/**
 * A Promise is returned by async methods as a hook to provide callbacks to be
 * called when the async task is fulfilled.
 *
 * <p>Typical usage would be like:<pre>
 *    query.find().then(function(results) {
 *      results[0].set("foo", "bar");
 *      return results[0].saveAsync();
 *    }).then(function(result) {
 *      console.log("Updated " + result.id);
 *    });
 * </pre></p>
 *
 * @class Parse.Promise
 * @constructor
 */
export default class ParsePromise {
  constructor() {
    this._resolved = false;
    this._rejected = false;
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];
  }

  /**
   * Marks this promise as fulfilled, firing any callbacks waiting on it.
   * @method resolve
   * @param {Object} result the result to pass to the callbacks.
   */
  resolve(...results) {
    if (this._resolved || this._rejected) {
      throw new Error(
        'A promise was resolved even though it had already been ' +
        (this._resolved ? 'resolved' : 'rejected') + '.'
      );
    }
    this._resolved = true;
    this._result = results;
    for (var i = 0; i < this._resolvedCallbacks.length; i++) {
      this._resolvedCallbacks[i].apply(this, results);
    }

    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];
  }

  /**
   * Marks this promise as fulfilled, firing any callbacks waiting on it.
   * @method reject
   * @param {Object} error the error to pass to the callbacks.
   */
  reject(error) {
    if (this._resolved || this._rejected) {
      throw new Error(
        'A promise was resolved even though it had already been ' +
        (this._resolved ? 'resolved' : 'rejected') + '.'
      );
    }
    this._rejected = true;
    this._error = error;
    for (var i = 0; i < this._rejectedCallbacks.length; i++) {
      this._rejectedCallbacks[i](error);
    }
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];
  }

  /**
   * Adds callbacks to be called when this promise is fulfilled. Returns a new
   * Promise that will be fulfilled when the callback is complete. It allows
   * chaining. If the callback itself returns a Promise, then the one returned
   * by "then" will not be fulfilled until that one returned by the callback
   * is fulfilled.
   * @method then
   * @param {Function} resolvedCallback Function that is called when this
   * Promise is resolved. Once the callback is complete, then the Promise
   * returned by "then" will also be fulfilled.
   * @param {Function} rejectedCallback Function that is called when this
   * Promise is rejected with an error. Once the callback is complete, then
   * the promise returned by "then" with be resolved successfully. If
   * rejectedCallback is null, or it returns a rejected Promise, then the
   * Promise returned by "then" will be rejected with that error.
   * @return {Parse.Promise} A new Promise that will be fulfilled after this
   * Promise is fulfilled and either callback has completed. If the callback
   * returned a Promise, then this Promise will not be fulfilled until that
   * one is.
   */
  then(resolvedCallback, rejectedCallback) {
    var promise = new ParsePromise();

    var wrappedResolvedCallback = function(...results) {
      if (typeof resolvedCallback === 'function') {
        if (isPromisesAPlusCompliant) {
          try {
            results = [resolvedCallback.apply(this, results)];
          } catch (e) {
            results = [ParsePromise.error(e)];
          }
        } else {
          results = [resolvedCallback.apply(this, results)];
        }
      }
      if (results.length === 1 && ParsePromise.is(results[0])) {
        results[0].then(function() {
          promise.resolve.apply(promise, arguments);
        }, function(error) {
          promise.reject(error);
        });
      } else {
        promise.resolve.apply(promise, results);
      }
    };

    var wrappedRejectedCallback = function(error) {
      var result = [];
      if (typeof rejectedCallback === 'function') {
        if (isPromisesAPlusCompliant) {
          try {
            result = [rejectedCallback(error)];
          } catch (e) {
            result = [ParsePromise.error(e)];
          }
        } else {
          result = [rejectedCallback(error)];
        }
        if (result.length === 1 && ParsePromise.is(result[0])) {
          result[0].then(function() {
            promise.resolve.apply(promise, arguments);
          }, function(error) {
            promise.reject(error);
          });
        } else {
          if (isPromisesAPlusCompliant) {
            promise.resolve.apply(promise, result);
          } else {
            promise.reject(result[0]);
          }
        }
      } else {
        promise.reject(error);
      }
    };

    var runLater = function(fn) {
      fn.call();
    };
    if (isPromisesAPlusCompliant) {
      if (typeof process !== 'undefined' &&
          typeof process.nextTick === 'function') {
        runLater = function(fn) {
          process.nextTick(fn);
        }
      } else if (typeof setTimeout === 'function') {
        runLater = function(fn) {
          setTimeout(fn, 0);
        }
      }
    }

    if (this._resolved) {
      runLater(() => {
        wrappedResolvedCallback.apply(this, this._result);
      });
    } else if (this._rejected) {
      runLater(() => {
        wrappedRejectedCallback(this._error);
      });
    } else {
      this._resolvedCallbacks.push(wrappedResolvedCallback);
      this._rejectedCallbacks.push(wrappedRejectedCallback);
    }

    return promise;
  }

  /**
   * Add handlers to be called when the promise
   * is either resolved or rejected
   * @method always
   */
  always(callback) {
    return this.then(callback, callback);
  }

  /**
   * Add handlers to be called when the Promise object is resolved
   * @method done
   */
  done(callback) {
    return this.then(callback);
  }

  /**
   * Add handlers to be called when the Promise object is rejected
   * @method fail
   */
  fail(callback) {
    return this.then(null, callback);
  }

  /**
   * Run the given callbacks after this promise is fulfilled.
   * @method _thenRunCallbacks
   * @param optionsOrCallback {} A Backbone-style options callback, or a
   * callback function. If this is an options object and contains a "model"
   * attributes, that will be passed to error callbacks as the first argument.
   * @param model {} If truthy, this will be passed as the first result of
   * error callbacks. This is for Backbone-compatability.
   * @return {Parse.Promise} A promise that will be resolved after the
   * callbacks are run, with the same result as this.
   */
  _thenRunCallbacks(optionsOrCallback, model) {
    var options = {};
    if (typeof optionsOrCallback === 'function') {
      options.success = function(result) {
        optionsOrCallback(result, null);
      };
      options.error = function(error) {
        optionsOrCallback(null, error);
      };
    } else if (typeof optionsOrCallback === 'object') {
      if (typeof optionsOrCallback.success === 'function') {
        options.success = optionsOrCallback.success;
      }
      if (typeof optionsOrCallback.error === 'function') {
        options.error = optionsOrCallback.error;
      }
    }

    return this.then(function(...results) {
      if (options.success) {
        options.success.apply(this, results);
      }
      return ParsePromise.as.apply(ParsePromise, arguments);
    }, function(error) {
      if (options.error) {
        if (typeof model !== 'undefined') {
          options.error(model, error);
        } else {
          options.error(error);
        }
      }
      // By explicitly returning a rejected Promise, this will work with
      // either jQuery or Promises/A+ semantics.
      return ParsePromise.error(error);
    });
  }

  /**
   * Adds a callback function that should be called regardless of whether
   * this promise failed or succeeded. The callback will be given either the
   * array of results for its first argument, or the error as its second,
   * depending on whether this Promise was rejected or resolved. Returns a
   * new Promise, like "then" would.
   * @method _continueWith
   * @param {Function} continuation the callback.
   */
  _continueWith(continuation) {
    return this.then(function() {
      return continuation(arguments, null);
    }, function(error) {
      return continuation(null, error);
    });
  }

  /**
   * Returns true iff the given object fulfils the Promise interface.
   * @method is
   * @param {Object} promise The object to test
   * @static
   * @return {Boolean}
   */
  static is(promise) {
    return (
      promise != null &&
      typeof promise.then === 'function'
    );
  }

  /**
   * Returns a new promise that is resolved with a given value.
   * @method as
   * @param value The value to resolve the promise with
   * @static
   * @return {Parse.Promise} the new promise.
   */
  static as(...values) {
    var promise = new ParsePromise();
    promise.resolve.apply(promise, values);
    return promise;
  }

  /**
   * Returns a new promise that is rejected with a given error.
   * @method error
   * @param error The error to reject the promise with
   * @static
   * @return {Parse.Promise} the new promise.
   */
  static error(...errors) {
    var promise = new ParsePromise();
    promise.reject.apply(promise, errors);
    return promise;
  }

  /**
   * Returns a new promise that is fulfilled when all of the input promises
   * are resolved. If any promise in the list fails, then the returned promise
   * will be rejected with an array containing the error from each promise.
   * If they all succeed, then the returned promise will succeed, with the
   * results being the results of all the input
   * promises. For example: <pre>
   *   var p1 = Parse.Promise.as(1);
   *   var p2 = Parse.Promise.as(2);
   *   var p3 = Parse.Promise.as(3);
   *
   *   Parse.Promise.when(p1, p2, p3).then(function(r1, r2, r3) {
   *     console.log(r1);  // prints 1
   *     console.log(r2);  // prints 2
   *     console.log(r3);  // prints 3
   *   });</pre>
   *
   * The input promises can also be specified as an array: <pre>
   *   var promises = [p1, p2, p3];
   *   Parse.Promise.when(promises).then(function(results) {
   *     console.log(results);  // prints [1,2,3]
   *   });
   * </pre>
   * @method when
   * @param {Array} promises a list of promises to wait for.
   * @static
   * @return {Parse.Promise} the new promise.
   */
  static when(promises) {
    var objects;
    if (Array.isArray(promises)) {
      objects = promises;
    } else {
      objects = arguments;
    }

    var total = objects.length;
    var hadError = false;
    var results = [];
    var errors = [];
    results.length = objects.length;
    errors.length = objects.length;

    if (total === 0) {
      return ParsePromise.as.apply(this, results);
    }

    var promise = new ParsePromise();

    var resolveOne = function() {
      total--;
      if (total <= 0) {
        if (hadError) {
          promise.reject(errors);
        } else {
          promise.resolve.apply(promise, results);
        }
      }
    };

    var chain = function(object, index) {
      if (ParsePromise.is(object)) {
        object.then(function(result) {
          results[index] = result;
          resolveOne();
        }, function(error) {
          errors[index] = error;
          hadError = true;
          resolveOne();
        });
      } else {
        results[i] = object;
        resolveOne();
      }
    };
    for (var i = 0; i < objects.length; i++) {
      chain(objects[i], i);
    }

    return promise;
  }

  /**
   * Runs the given asyncFunction repeatedly, as long as the predicate
   * function returns a truthy value. Stops repeating if asyncFunction returns
   * a rejected promise.
   * @method _continueWhile
   * @param {Function} predicate should return false when ready to stop.
   * @param {Function} asyncFunction should return a Promise.
   * @static
   */
  static _continueWhile(predicate, asyncFunction) {
    if (predicate()) {
      return asyncFunction().then(function() {
        return ParsePromise._continueWhile(predicate, asyncFunction);
      });
    }
    return ParsePromise.as();
  }

  static isPromisesAPlusCompliant() {
    return isPromisesAPlusCompliant;
  }

  static enableAPlusCompliant() {
    isPromisesAPlusCompliant = true;
  }

  static disableAPlusCompliant() {
    isPromisesAPlusCompliant = false;
  }
}
