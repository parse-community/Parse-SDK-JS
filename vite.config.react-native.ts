import { defineConfig } from 'vite';
import { resolve } from 'path';
import { glob } from "glob"
const version = require('./package.json').version;

export default defineConfig({
  define: {
    'process.env.PARSE_BUILD': '"react-native"',
    'process.env.PARSE_VERSION': `"js${version}"`,
  },
  build: {
    lib: {
      entry: glob.sync(resolve(__dirname, 'src/*.ts')),
      formats: ['cjs'],
      fileName: (_, name) => `${name}.js`,
    },
    outDir: 'lib/react-native',
    rollupOptions: {
    },
    minify: false,
    sourcemap: false,
  }
});
