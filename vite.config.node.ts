import { defineConfig } from 'vite';
import { resolve } from 'path';
import { glob } from "glob";
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import polyfillNode from 'rollup-plugin-polyfill-node';
const version = require('./package.json').version;

export default defineConfig({
  define: {
    'process.env.PARSE_BUILD': '"node"',
    'process.env.PARSE_VERSION': `"js${version}"`,
  },
  build: {
    target: 'node18',
    lib: {
      entry: glob.sync(resolve(__dirname, 'src/*.ts')),
      formats: ['cjs'],
      fileName: (_, name) => `${name}.js`,
    },
    outDir: 'lib/node',
    rollupOptions: {
      external: ['ws', 'uuid'],
      plugins: [
        nodeResolve({
          preferBuiltins: true,
        }),
        polyfillNode(),
        babel({
          extensions: ['.ts', '.js'],
          presets: [
            '@babel/preset-typescript',
            ['@babel/preset-env', { targets: { node: "18" } }]
          ],
          plugins: [
            'inline-package-json',
            'transform-inline-environment-variables'
          ],
          exclude: /node_modules/,
        }) as any,
      ],
    },
    minify: false,
    sourcemap: false,
  },
});
