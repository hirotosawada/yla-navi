import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// test/ が Vite の root なので、HTML の ../src/scss/yla.scss は
// ブラウザ上では /src/scss/yla.scss（test 側）に解決されてしまう。
// 開発サーバーではライブラリ本体の SCSS を /@fs で渡す。
function serveLibraryStylesheet() {
  const stylesheet = resolve(__dirname, '../src/scss/yla.scss');
  return {
    name: 'serve-library-stylesheet',
    apply: 'serve',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const served = `href="/@fs${stylesheet}"`;
        return html.replaceAll('href="../src/scss/yla.scss"', served).replaceAll('href="/src/scss/yla.scss"', served);
      },
    },
  };
}

export default defineConfig({
  root: 'test',
  plugins: [serveLibraryStylesheet()],
  build: {
    outDir: '../demo',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        yla: resolve(__dirname, 'yla.html'),
        valikko: resolve(__dirname, 'valikko.html'),
      },
    },
  },
});
