import { defineConfig } from 'vite';
import { resolve } from 'path';
import { glob } from "glob"
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default defineConfig({
  define: {
    'process.env.PARSE_BUILD': '"react-native"',
  },
  build: {
    lib: {
      entry: glob.sync(resolve(__dirname, 'src/*.ts')),
      formats: ['cjs'],
      fileName: (_, name) => `${name}.js`,
    },
    outDir: 'lib/react-native',
    rollupOptions: {
      plugins: [
        nodeResolve({
          preferBuiltins: true,
        }),
        babel({
          babelHelpers: 'runtime',
          extensions: ['.ts', '.js'],
          presets: [
            '@babel/preset-typescript',
            ['module:metro-react-native-babel-preset', { disableImportExportTransform: true }]
          ],
          plugins: [
            '@babel/plugin-transform-class-static-block',
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
