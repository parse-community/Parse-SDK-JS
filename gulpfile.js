var babel      = require('gulp-babel');
var browserify = require('browserify');
var derequire  = require('gulp-derequire');
var gulp       = require('gulp');
var insert     = require('gulp-insert');
var path       = require('path');
var rename     = require('gulp-rename');
var replace    = require('gulp-replace');
var source     = require('vinyl-source-stream');
var uglify     = require('gulp-uglify');

var BUILD = process.env.PARSE_BUILD || 'browser';
var VERSION = require('./package.json').version;

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
  var packageJSON = {
    version: VERSION
  };
  return gulp.src('src/*.js')
    .pipe(babel({
      experimental: true,
      optional: [
        'runtime',
        'utility.inlineEnvironmentVariables'
      ],
      plugins: [
        'inline-package-json',
        require('./vendor/babel-plugin-dead-code-elimination')
      ],
    }))
    .pipe(gulp.dest(path.join('lib', BUILD)));
});

gulp.task('browserify', function() {
  var stream = browserify({
    builtins: ['_process', 'events'],
    entries: 'lib/browser/Parse.js',
    standalone: 'Parse'
  })
  .exclude('xmlhttprequest')
  .ignore('_process')
  .bundle();

  return stream.pipe(source('parse-latest.js'))
    .pipe(derequire())
    .pipe(insert.prepend(DEV_HEADER))
    .pipe(gulp.dest('./dist'));
});

gulp.task('minify', function() {
  return gulp.src('dist/parse-latest.js')
    .pipe(uglify())
    .pipe(insert.prepend(FULL_HEADER))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./dist'))
});
