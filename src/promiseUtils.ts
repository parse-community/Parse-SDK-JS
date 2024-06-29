// Create Deferred Promise
export function resolvingPromise<T = any>() {
  let res: (value: T) => void;
  let rej: (error: T) => void;
  const promise = new Promise<T>((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  const defer: typeof promise & { resolve: (res: T) => void; reject: (err: any) => void } =
    promise as any;
  defer.resolve = res!;
  defer.reject = rej!;
  return defer;
}

export function when(promises: any) {
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

  const promise = resolvingPromise();

  const resolveOne = function () {
    total--;
    if (total <= 0) {
      if (hadError) {
        promise.reject(errors);
      } else {
        promise.resolve(returnValue);
      }
    }
  };

  const chain = function (object: Promise<any>, index: number) {
    if (object && typeof object.then === 'function') {
      object.then(
        function (result) {
          results[index] = result;
          resolveOne();
        },
        function (error) {
          errors[index] = error;
          hadError = true;
          resolveOne();
        }
      );
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

export function continueWhile(test: () => any, emitter: () => Promise<any>) {
  if (test()) {
    return emitter().then(() => {
      return continueWhile(test, emitter);
    });
  }
  return Promise.resolve();
}
