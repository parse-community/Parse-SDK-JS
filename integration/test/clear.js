const Parse = require('parse/node');

module.exports = function() {
  return Parse._ajax('GET', 'http://localhost:1337/clear', '');
};
