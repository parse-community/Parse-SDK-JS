const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [["env", {
      "targets": {
          "node": "8"
      }
  }], 'es2015', 'react'],
  plugins: [],
});
