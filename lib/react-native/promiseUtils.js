export function resolvingPromise() {
  let res;
  let rej;
  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  promise.resolve = res;
  promise.reject = rej;
  return promise;
}
export function when(promises) {
  var objects;
  var arrayArgument = Array.isArray(promises);

  if (arrayArgument) {
    objects = promises;
  } else {
    objects = arguments;
  }

  var total = objects.length;
  var hadError = false;
  var results = [];
  var returnValue = arrayArgument ? [results] : results;
  var errors = [];
  results.length = objects.length;
  errors.length = objects.length;

  if (total === 0) {
    return Promise.resolve(returnValue);
  }

  var promise = new resolvingPromise();

  var resolveOne = function () {
    total--;

    if (total <= 0) {
      if (hadError) {
        promise.reject(errors);
      } else {
        promise.resolve(returnValue);
      }
    }
  };

  var chain = function (object, index) {
    if (object && typeof object.then === 'function') {
      object.then(function (result) {
        results[index] = result;
        resolveOne();
      }, function (error) {
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
export function continueWhile(test, emitter) {
  if (test()) {
    return emitter().then(() => {
      return continueWhile(test, emitter);
    });
  }

  return Promise.resolve();
}