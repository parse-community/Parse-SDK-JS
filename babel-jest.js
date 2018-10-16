const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [["@babel/preset-env", {
    "targets": {
      "node": "8"
    }
  }]],
  plugins: ['@babel/plugin-transform-flow-comments'],
});
