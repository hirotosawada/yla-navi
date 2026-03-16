import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/Yla.ts'),
      name: 'Yla',
      formats: ['umd'],
      fileName: () => 'yla.min.js',
    },
  },
});
