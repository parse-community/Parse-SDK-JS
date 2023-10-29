// Create Deferred Promise
export function resolvingPromise<T = any>() {
  let res: (val: T) => void;
  let rej: (err: any) => void;
  const promise = new Promise<T>((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  const ret: typeof promise & { resolve: (res: T) => void, reject: (err: any) => void } = promise as any;
  ret.resolve = res!;
  ret.reject = rej!;
  return ret;
}

export function when(promises: Promise<any> | Promise<any>[]) {
  let objects: Promise<any>[];
  const arrayArgument = Array.isArray(promises);
  if (arrayArgument) {
    objects = promises;
  } else {
    objects = [promises];
  }

  let total = objects.length;
  let hadError = false;
  const results: any[] = [];
  const returnValue = arrayArgument ? [results] : results;
  const errors: any[] = [];
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

export function continueWhile(test: () => boolean, emitter: () => Promise<void | any>) {
  if (test()) {
    return emitter().then(() => {
      return continueWhile(test, emitter);
    });
  }
  return Promise.resolve();
}
