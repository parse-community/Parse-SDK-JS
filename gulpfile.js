var babel      = require('gulp-babel');
var browserify = require('browserify');
var derequire  = require('gulp-derequire');
var gulp       = require('gulp');
var insert     = require('gulp-insert');
var path       = require('path');
var rename     = require('gulp-rename');
var source     = require('vinyl-source-stream');
var uglify     = require('gulp-uglify');
var watch      = require('gulp-watch');

var BUILD = process.env.PARSE_BUILD || 'browser';
var VERSION = require('./package.json').version;

var transformRuntime = ["@babel/plugin-transform-runtime", {
  "corejs": 3,
  "helpers": true,
  "regenerator": true,
  "useESModules": false
}];

var PRESETS = {
  'browser': [["@babel/preset-env", {
    "targets": "> 0.25%, not dead"
  }], '@babel/preset-react'],
  'weapp': [["@babel/preset-env", {
    "targets": "> 0.25%, not dead"
  }], '@babel/preset-react'],
  'node': [["@babel/preset-env", {
    "targets": { "node": "8" }
  }]],
  'react-native': ['module:metro-react-native-babel-preset'],
};
var PLUGINS = {
  'browser': [transformRuntime, '@babel/plugin-transform-flow-comments', '@babel/plugin-proposal-class-properties', 'inline-package-json',
    ['transform-inline-environment-variables', {'exclude': ['SERVER_RENDERING']}]],
  'weapp': [transformRuntime, '@babel/plugin-transform-flow-comments', '@babel/plugin-proposal-class-properties', 'inline-package-json',
    ['transform-inline-environment-variables', {'exclude': ['SERVER_RENDERING']}]],
  'node': ['@babel/plugin-transform-flow-comments', 'inline-package-json', 'transform-inline-environment-variables'],
  'react-native': ['@babel/plugin-transform-flow-comments', 'inline-package-json', 'transform-inline-environment-variables']
};

var DEV_HEADER = (
  '/**\n' +
  ' * Parse JavaScript SDK v' + VERSION + '\n' +
  ' *\n' +
  ' * The source tree of this library can be found at\n' +
  ' *   https://github.com/ParsePlatform/Parse-SDK-JS\n' +
  ' */\n'
);

var FULL_HEADER = (
  '/**\n' +
  ' * Parse JavaScript SDK v' + VERSION + '\n' +
  ' *\n' +
  ' * Copyright (c) 2015-present, Parse, LLC.\n' +
  ' * All rights reserved.\n' +
  ' *\n' +
  ' * The source tree of this library can be found at\n' +
  ' *   https://github.com/ParsePlatform/Parse-SDK-JS\n' +
  ' * This source code is licensed under the BSD-style license found in the\n' +
  ' * LICENSE file in the root directory of this source tree. An additional grant\n' +
  ' * of patent rights can be found in the PATENTS file in the same directory.\n' +
  ' */\n'
);

gulp.task('compile', function() {
  return gulp.src('src/*.js')
    .pipe(babel({
      presets: PRESETS[BUILD],
      plugins: PLUGINS[BUILD],
    }))
    // Second pass to kill BUILD-switched code
    .pipe(babel({
      plugins: ['minify-dead-code-elimination'],
    }))
    .pipe(gulp.dest(path.join('lib', BUILD)));
});

gulp.task('browserify', function(cb) {
  var stream = browserify({
    builtins: ['_process', 'events'],
    entries: 'lib/browser/Parse.js',
    standalone: 'Parse'
  })
    .exclude('xmlhttprequest')
    .ignore('_process')
    .bundle();
  stream.on('end', () => {
    cb();
  });
  return stream.pipe(source('parse.js'))
    .pipe(derequire())
    .pipe(insert.prepend(DEV_HEADER))
    .pipe(gulp.dest('./dist'));
});


gulp.task('browserify-weapp', function(cb) {
  var stream = browserify({
    builtins: ['_process', 'events'],
    entries: 'lib/weapp/Parse.js',
    standalone: 'Parse'
  })
    .exclude('xmlhttprequest')
    .ignore('_process')
    .bundle();
  stream.on('end', () => {
    cb();
  });
  return stream.pipe(source('parse.weapp.js'))
    .pipe(derequire())
    .pipe(insert.prepend(DEV_HEADER))
    .pipe(gulp.dest('./dist'));
});

gulp.task('minify', function() {
  return gulp.src('dist/parse.js')
    .pipe(uglify())
    .pipe(insert.prepend(FULL_HEADER))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./dist'))
});

gulp.task('minify-weapp', function() {
  return gulp.src('dist/parse.weapp.js')
    .pipe(uglify())
    .pipe(insert.prepend(FULL_HEADER))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./dist'))
});

gulp.task('watch', function() {
  return watch('src/*.js', { ignoreInitial: false, verbose: true })
    .pipe(babel({
      presets: PRESETS[BUILD],
      plugins: PLUGINS[BUILD],
    }))
    // Second pass to kill BUILD-switched code
    .pipe(babel({
      plugins: ['minify-dead-code-elimination'],
    }))
    .pipe(gulp.dest(path.join('lib', BUILD)));
});
