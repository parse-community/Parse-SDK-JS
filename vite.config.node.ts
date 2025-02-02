import { defineConfig } from 'vite';
import { resolve } from 'path';
import babel from '@rollup/plugin-babel';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/Parse.ts'),
      formats: ['cjs'],
      fileName: () => 'Parse.js',
    },
    outDir: 'lib/node',
    rollupOptions: {
      plugins: [
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
