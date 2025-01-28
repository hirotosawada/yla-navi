import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/drawer-menu.ts'),
      name: 'drawer_menu',
      fileName: (format) => (format === 'umd' ? 'drawer-menu.min.js' : `drawer-menu.${format}.js`),
    },
  },
});
