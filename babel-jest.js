const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: ["@babel/preset-typescript", ["@babel/preset-env", {
    "targets": {
      "node": "14"
    },
    useBuiltIns: 'entry',
    corejs: 3,
  }]],
  plugins: ['@babel/plugin-transform-flow-comments'],
});
