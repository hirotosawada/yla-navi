import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      exclude: ['src/Tab.ts'],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'yla_navi',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'umd' ? 'yla-bundle.min.js' : 'yla-bundle.js'),
    },
  },
});
