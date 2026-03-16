import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/Valikko.ts'),
      name: 'Valikko',
      formats: ['umd'],
      fileName: () => 'valikko.min.js',
    },
  },
});
