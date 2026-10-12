# Ylä

ドロワーナビ（Yla）と多段ドロップダウン（Valikko）のライブラリです。

## インストール

```sh
npm install @darowasahito/yla-navi
```

## CDN

[jsDelivr のパッケージページ](https://www.jsdelivr.com/package/npm/@darowasahito/yla-navi) から配信しています。バージョンは `2.0.0` です。

CSS はスクリプトより先に読みます。バンドルを読むと `Yla` と `Valikko` がグローバルになります。

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@darowasahito/yla-navi@2.0.0/dist/yla.css" />
<script src="https://cdn.jsdelivr.net/npm/@darowasahito/yla-navi@2.0.0/dist/yla-bundle.min.js"></script>
<script>
  const yla = new Yla(document.querySelector('.yla'));
  const valikko = new Valikko(document.querySelector('.valikko'));
</script>
```

## スタイル

初期化前に隠す指定は、スクリプトより先に読みます。

```html
<link rel="stylesheet" href="node_modules/@darowasahito/yla-navi/yla.css" />
```

入っているのは、初期化前の非表示、オーバーレイを画面いっぱいに固定する指定、スクロールロック中の `overflow` です。色やメニューのデザインは入っていません。見た目はページ側で指定します。

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

マークアップとオプションは [ドキュメント](https://hirotosawada.github.io/yla-navi/) を参照してください。
