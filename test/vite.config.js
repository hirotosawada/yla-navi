import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
export default defineConfig({
  root: 'test',
  build: {
    outDir: '../demo',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        navi: resolve(__dirname, 'navi.html'),
      },
    },
  },
});
