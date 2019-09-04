const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [["@babel/preset-env", {
    "targets": {
      "node": "8"
    },
    useBuiltIns: 'entry',
    corejs: 3,
  }]],
  plugins: ['@babel/plugin-transform-flow-comments'],
});
