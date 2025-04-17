import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import commonjs from 'vite-plugin-commonjs'
import terser from '@rollup/plugin-terser';
import { resolve } from 'path';
import pkg from './package.json';

const banner = `/**
 * Parse JavaScript SDK v${pkg.version}
 *
 * Copyright 2015-present Parse Platform
 * All rights reserved.
 *
 * The source tree of this library can be found at:
 *   https://github.com/parse-community/Parse-SDK-JS
 *
 * This source code is licensed under the license found in the LICENSE
 * file in the root directory of this source tree. Additional legal
 * information can be found in the NOTICE file in the same directory.
 */
`;

const FILE_NAME = process.env.PARSE_BUILD === 'browser' ? 'parse' : 'parse.weapp';
const build = {
  name: 'Parse',
  globals: {
    xmlhttprequest: 'XMLHttpRequest',
    _process: 'process',
  },
  banner,
};
const umdBuilds: any = [{
  entryFileNames: `${FILE_NAME}.js`,
  format: 'umd',
  ...build,
}, {
  entryFileNames: `${FILE_NAME}.min.js`,
  format: 'umd',
  ...build,
  plugins: [
    terser({
      format: {
        comments: false,
      },
    }) as any,
  ],
}];

export default defineConfig({
  plugins: [nodePolyfills(), commonjs()],
  define: {
    'process.env.PARSE_BUILD': `"${process.env.PARSE_BUILD}"`,
    'process.env.npm_package_version': `"${pkg.version}"`,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/Parse.ts'),
      external: ['xmlhttprequest', '_process'],
      output: [...umdBuilds],
    },
    minify: false,
    sourcemap: false,
  },
  resolve: {
    alias: {
      'react-native/Libraries/vendor/emitter/EventEmitter': 'events',
      'EventEmitter': 'events',
    },
  },
});
