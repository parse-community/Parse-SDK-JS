import { defineConfig } from 'vite';
import { resolve } from 'path';
import { glob } from "glob"
import { nodePolyfills } from 'vite-plugin-node-polyfills'
const version = require('./package.json').version;

export default defineConfig({
  define: {
    'process.env.PARSE_BUILD': '"react-native"',
    'process.env.PARSE_VERSION': `"js${version}"`,
  },
  plugins: [
    nodePolyfills(),
  ],
  build: {
    target: 'esnext',
    lib: {
      entry: glob.sync(resolve(__dirname, 'src/*.ts')),
      formats: ['cjs'],
      fileName: (_, name) => `${name}.js`,
    },
    outDir: 'lib/react-native',
    rollupOptions: {
      external: ['react-native-crypto-js', 'react-native-get-random-values', 'react-native', 'uuid'],
      plugins: [
        
      ]
    },
    minify: false,
    sourcemap: false,
  },
  optimizeDeps: {
    exclude: ['react-native-crypto-js', 'react-native-get-random-values', 'react-native', 'uuid']
  }  
});
