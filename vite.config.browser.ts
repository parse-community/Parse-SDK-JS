import { defineConfig } from 'vite';
import { terser } from 'rollup-plugin-terser';
import { resolve } from 'path';
import pkg from './package.json';
import commonjs from 'vite-plugin-commonjs'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const DEV_HEADER = `/**
 * Parse JavaScript SDK v${pkg.version}
 *
 * The source tree of this library can be found at:
 *   https://github.com/ParsePlatform/Parse-SDK-JS
 */
`;

const FULL_HEADER = `/**
 * Parse JavaScript SDK v${pkg.version}
 *
 * Copyright 2015-present Parse Platform
 * All rights reserved.
 *
 * The source tree of this library can be found at:
 *   https://github.com/ParsePlatform/Parse-SDK-JS
 *
 * This source code is licensed under the license found in the LICENSE
 * file in the root directory of this source tree. Additional legal
 * information can be found in the NOTICE file in the same directory.
 */
`;

export default defineConfig({
  plugins: [nodePolyfills(), commonjs()],
  define: {
    'process.env.PARSE_BUILD': '"browser"',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/Parse.ts'),
      external: ['xmlhttprequest', '_process'],
      output: [
        {
          entryFileNames: 'parse.js',
          format: 'umd',
          name: 'Parse',
          globals: {
            xmlhttprequest: 'XMLHttpRequest',
            _process: 'process',
          },
          banner: DEV_HEADER,
        },
        {
          entryFileNames: 'parse.min.js',
          format: 'umd',
          name: 'Parse',
          globals: {
            xmlhttprequest: 'XMLHttpRequest',
            _process: 'process',
          },
          banner: FULL_HEADER,
          plugins: [
            terser({
              format: {
                comments: false,
              },
            }) as any,
          ],
        }
      ]
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
