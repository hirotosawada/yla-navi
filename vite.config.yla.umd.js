import { readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const buildDate = new Date().toISOString();
const banner = `/*! ${pkg.displayName || pkg.name} v${pkg.version} | ${pkg.license} | ${buildDate} */\n`;

function bannerPlugin(bannerText) {
  return {
    name: 'banner-first',
    generateBundle(_, bundle) {
      for (const file of Object.keys(bundle)) {
        const chunk = bundle[file];
        if (chunk.type === 'chunk' && chunk.code) {
          chunk.code = bannerText + chunk.code;
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: false,
      exclude: ['src/Tab.ts'],
    }),
    bannerPlugin(banner),
  ],
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/Yla.ts'),
      name: 'Yla',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'umd' ? 'yla.min.js' : 'yla.esm.js'),
    },
  },
});
