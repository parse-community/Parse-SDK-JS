import { defineConfig } from 'vite';
import { resolve } from 'path';
import { glob } from "glob"
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default defineConfig({
  define: {
    'process.env.PARSE_BUILD': '"node"',
  },
  build: {
    lib: {
      entry: glob.sync(resolve(__dirname, 'src/*.ts')),
      formats: ['cjs'],
      fileName: (_, name) => `${name}.js`,
    },
    outDir: 'lib/node',
    rollupOptions: {
      plugins: [
        nodeResolve({
          preferBuiltins: true,
        }),
        babel({
          extensions: ['.ts', '.js'],
          presets: [
            '@babel/preset-typescript',
            ['@babel/preset-env', { targets: { node: "14" } }]
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
    sourcemap: true,
  }
});
