const Parse = require('../../node');

/**
 * Destroys all data in the database
 * Calls /clear route in integration/test/server.js
 *
 * @param {boolean} fast set to true if it's ok to just drop objects and not indexes.
 * @returns {Promise} A promise that is resolved when database is deleted.
 */
module.exports = function (fast = true) {
  return Parse._ajax('GET', `http://localhost:1337/clear/${fast}`, '');
};
