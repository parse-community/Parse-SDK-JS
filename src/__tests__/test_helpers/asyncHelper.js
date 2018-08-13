/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
/* global runs waitsFor */
// We need this until Jest finishes upgrading to Jasmine 2.0
module.exports = function asyncHelper(fn) {
  let finished = false;
  const done = function() {
    finished = true;
  };

  return function() {
    runs(function() {
      fn(done);
    });

    waitsFor(function() {
      return finished;
    });
  };
}
