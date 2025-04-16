const babel      = require('gulp-babel');
const gulp       = require('gulp');
const path       = require('path');
const watch      = require('gulp-watch');

const BUILD = process.env.PARSE_BUILD || 'browser';

const transformRuntime = ["@babel/plugin-transform-runtime", {
  "corejs": 3,
  "helpers": true,
  "regenerator": true,
  "useESModules": false
}];

const PRESETS = {
  'browser': ["@babel/preset-typescript", ["@babel/preset-env", {
    "targets": "> 0.25%, not dead"
  }]],
  'weapp': ["@babel/preset-typescript", ["@babel/preset-env", {
    "targets": "> 0.25%, not dead"
  }], '@babel/react'],
  'node': ["@babel/preset-typescript", ["@babel/preset-env", {
    "targets": { "node": "14" }
  }]],
  'react-native': ["@babel/preset-typescript", 'module:metro-react-native-babel-preset'],
};
const PLUGINS = {
  'browser': [transformRuntime, '@babel/plugin-proposal-class-properties',
    ['transform-inline-environment-variables', {'exclude': ['SERVER_RENDERING']}]],
  'weapp': [transformRuntime, '@babel/plugin-proposal-class-properties',
    ['transform-inline-environment-variables', {'exclude': ['SERVER_RENDERING']}]],
  'node': ['transform-inline-environment-variables'],
  'react-native': ['transform-inline-environment-variables']
};

function compileTask(stream) {
  return stream
    .pipe(babel({
      presets: PRESETS[BUILD],
      plugins: PLUGINS[BUILD],
    }))
    // Second pass to kill BUILD-switched code
    .pipe(babel({
      plugins: ['minify-dead-code-elimination'],
    }))
    .pipe(gulp.dest(path.join('lib', BUILD)));
}

gulp.task('compile', function() {
  return compileTask(gulp.src('src/*.*(js|ts)'));
});

gulp.task('watch', function() {
  return compileTask(watch('src/*.*(js|ts)', { ignoreInitial: false, verbose: true }));
});
