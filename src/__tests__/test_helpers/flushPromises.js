const { setImmediate } = require('timers');
/**
 * Wait for all asynchronous code to finish executing
 */
function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

module.exports = flushPromises;
