# Ylä

ドロワーナビ（Yla）と多段ドロップダウン（Valikko）のライブラリです。

## インストール

```sh
npm install @darowasahito/yla-navi
```

## スタイル

初期化前に隠す指定は、スクリプトより先に読みます。

```html
<link rel="stylesheet" href="node_modules/@darowasahito/yla-navi/yla.css" />
```

オーバーレイの見た目と、スクロールロック中の `overflow` もこのファイルに入っています。配置や色はページ側で上書きできます。

## ESM

```ts
import Yla, { Valikko } from '@darowasahito/yla-navi';

const yla = new Yla(document.querySelector('.yla'), { breakpoint: 768 });
const valikko = new Valikko(document.querySelector('.valikko'));
```

Yla だけ、Valikko だけを読む場合:

```ts
import Yla from '@darowasahito/yla-navi/yla';
import Valikko from '@darowasahito/yla-navi/valikko';
```

## スクリプトタグ

バンドルは `dist/yla-bundle.min.js` です。読み込むと `Yla` と `Valikko` がグローバルになります。

```html
<script src="yla-bundle.min.js"></script>
<script>
  const yla = new Yla(document.querySelector('.yla'));
  const valikko = new Valikko(document.querySelector('.valikko'));
</script>
```

単体は `dist/yla.min.js`（グローバル `Yla`）と `dist/valikko.min.js`（グローバル `Valikko`）です。
