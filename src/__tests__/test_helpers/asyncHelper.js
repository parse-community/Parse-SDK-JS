/* global runs waitsFor */
// We need this until Jest finishes upgrading to Jasmine 2.0
module.exports = function asyncHelper(fn) {
  let finished = false;
  const done = function () {
    finished = true;
  };

  return function () {
    runs(function () {
      fn(done);
    });

    waitsFor(function () {
      return finished;
    });
  };
};
