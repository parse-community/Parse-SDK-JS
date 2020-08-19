const Parse = require('../../node');

/**
 * Destroys all data in the database
 * Calls /clear route in integration/test/server.js
 *
 * @param {boolean} fast set to true if it's ok to just drop objects and not indexes.
 */
module.exports = function(fast = false) {
  return Parse._ajax('GET', `http://localhost:1337/clear/${fast}`, '');
};
