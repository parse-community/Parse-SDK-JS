import { defineConfig } from 'vite';
import { terser } from 'rollup-plugin-terser';
import { resolve } from 'path';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';

// You can define a DEV header if needed (here we reuse FULL_HEADER for the minified file)
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
  build: {
    outDir: 'dist',
    minify: false,
    sourcemap: false,
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/Parse.ts'),
      external: ['xmlhttprequest', '_process', 'events'],
      output: [
        {
          entryFileNames: 'parse.weapp.js',
          format: 'umd',
          name: 'Parse',
          globals: {
            xmlhttprequest: 'XMLHttpRequest',
            _process: 'process',
            events: 'EventEmitter',
          },
          banner: DEV_HEADER,
        },
        {
          entryFileNames: 'parse.weapp.min.js',
          format: 'umd',
          name: 'Parse',
          globals: {
            xmlhttprequest: 'XMLHttpRequest',
            _process: 'process',
            events: 'EventEmitter',
          },
          banner: FULL_HEADER,
          plugins: [
            terser({
              format: {
                comments: false,
              },
            }) as any,
          ],
        },
      ],
      plugins: [
        babel({
          babelHelpers: 'runtime',
          extensions: ['.ts', '.js'],
          presets: [
            '@babel/preset-typescript',
            ['@babel/preset-env', { targets: "> 0.25%, not dead" }],
            '@babel/react'
          ],
          plugins: [
            [
              '@babel/plugin-transform-runtime',
              { corejs: 3, helpers: true, regenerator: true, useESModules: false }
            ],
            '@babel/plugin-proposal-class-properties',
            'inline-package-json',
            ['transform-inline-environment-variables', { exclude: ['SERVER_RENDERING'] }]
          ],
          exclude: /node_modules/,
        }) as any,
      ],
    },
  },
});
