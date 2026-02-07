import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/Valikko.ts'),
      name: 'yla_navi',
      formats: ['umd'],
      fileName: () => 'valikko.min.js',
    },
  },
});
