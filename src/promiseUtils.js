// Create Deferred Promise
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
  let objects;
  const arrayArgument = Array.isArray(promises);
  if (arrayArgument) {
    objects = promises;
  } else {
    objects = arguments;
  }

  let total = objects.length;
  let hadError = false;
  const results = [];
  const returnValue = arrayArgument ? [results] : results;
  const errors = [];
  results.length = objects.length;
  errors.length = objects.length;

  if (total === 0) {
    return Promise.resolve(returnValue);
  }

  const promise = new resolvingPromise();

  const resolveOne = function() {
    total--;
    if (total <= 0) {
      if (hadError) {
        promise.reject(errors);
      } else {
        promise.resolve(returnValue);
      }
    }
  };

  const chain = function(object, index) {
    if (object && typeof object.then  === 'function') {
      object.then(function(result) {
        results[index] = result;
        resolveOne();
      }, function(error) {
        errors[index] = error;
        hadError = true;
        resolveOne();
      });
    } else {
      results[index] = object;
      resolveOne();
    }
  };
  for (let i = 0; i < objects.length; i++) {
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
