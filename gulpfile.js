const babel      = require('gulp-babel');
const browserify = require('browserify');
const derequire  = require('gulp-derequire');
const gulp       = require('gulp');
const insert     = require('gulp-insert');
const path       = require('path');
const rename     = require('gulp-rename');
const source     = require('vinyl-source-stream');
const uglify     = require('gulp-uglify');
const watch      = require('gulp-watch');

const BUILD = process.env.PARSE_BUILD || 'browser';
const VERSION = require('./package.json').version;

const transformRuntime = ["@babel/transform-runtime", {
  "corejs": 3,
  "helpers": true,
  "regenerator": true,
  "useESModules": false
}];

const PRESETS = {
  'browser': [["@babel/preset-env", {
    "targets": "> 0.25%, not dead"
  }]],
  'weapp': [["@babel/preset-env", {
    "targets": "> 0.25%, not dead"
  }], '@babel/react'],
  'node': [["@babel/preset-env", {
    "targets": { "node": "14" }
  }]],
  'react-native': ['module:metro-react-native-babel-preset'],
};
const PLUGINS = {
  'browser': [transformRuntime, '@babel/plugin-transform-flow-comments', '@babel/plugin-proposal-class-properties', 'inline-package-json',
    ['transform-inline-environment-variables', {'exclude': ['SERVER_RENDERING']}]],
  'weapp': [transformRuntime, '@babel/plugin-transform-flow-comments', '@babel/plugin-proposal-class-properties', 'inline-package-json',
    ['transform-inline-environment-variables', {'exclude': ['SERVER_RENDERING']}]],
  'node': ['@babel/plugin-transform-flow-comments', 'inline-package-json', 'transform-inline-environment-variables'],
  'react-native': ['@babel/plugin-transform-flow-comments', 'inline-package-json', 'transform-inline-environment-variables']
};

const DEV_HEADER = (
  '/**\n' +
  ' * Parse JavaScript SDK v' + VERSION + '\n' +
  ' *\n' +
  ' * The source tree of this library can be found at\n' +
  ' *   https://github.com/ParsePlatform/Parse-SDK-JS\n' +
  ' */\n'
);

const FULL_HEADER = (
  '/**\n' +
  ' * Parse JavaScript SDK v' + VERSION + '\n' +
  ' *\n' +
  ' * Copyright 2015-present Parse Platform\n' +
  ' * All rights reserved.\n' +
  ' *\n' +
  ' * The source tree of this library can be found at\n' +
  ' *   https://github.com/ParsePlatform/Parse-SDK-JS\n' +
  ' *\n' +
  ' * This source code is licensed under the license found in the LICENSE\n' +
  ' * file in the root directory of this source tree. Additional legal\n' +
  ' * information can be found in the NOTICE file in the same directory.\n' +
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
  const stream = browserify({
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
  const stream = browserify({
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
