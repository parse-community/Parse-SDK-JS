/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Mock an XMLHttpRequest by pre-defining the statuses and results that it
 * return.
 * `results` is an array of objects of the form:
 *   { status: ..., response: ... }
 * where status is a HTTP status number and result is a JSON object to pass
 * alongside it.
 * `upload` can be provided to mock the XMLHttpRequest.upload property.
 */
function mockXHR(results, options = {}) {
  const XHR = function() { };
  let attempts = 0;
  XHR.prototype = {
    open: function() { },
    setRequestHeader: function() { },
    upload: function() { },
    send: function() {
      this.status = results[attempts].status;
      this.responseText = JSON.stringify(results[attempts].response || {});
      this.readyState = 4;
      attempts++;
      this.onreadystatechange();
      this.onprogress(options.progress);
      this.upload.onprogress(options.progress);
    }
  };
  return XHR;
}

module.exports = mockXHR;
