import { defineConfig } from 'vite';
import { resolve } from 'path';
import { glob } from "glob"
import babel from '@rollup/plugin-babel';

export default defineConfig({
  build: {
    lib: {
      entry: glob.sync(resolve(__dirname, 'src/*.ts')),
      formats: ['cjs'],
      fileName: (_, name) => `${name}.js`,
    },
    outDir: 'lib/react-native',
    rollupOptions: {
      plugins: [
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
    // For react-native you may not want to minify the output.
    minify: false,
    sourcemap: true,
  }
});
