# Yla

ドロワー／オーバーレイ型のヘッダーナビです。`breakpoint` 未満でドロワーを有効にし、それ以上では無効にします。`breakpoint` を省略するか `null` にすると、幅に関係なくドロワーが有効です。

## マークアップ

コンストラクタに渡す要素がコンテナ（`.yla`）です。トリガーとオーバーレイは `document` から、ナビはコンテナの中から探します。ナビが無いときはコンテナ自身を開閉対象にします。

```html
<div class="yla-overlay" aria-hidden="true"></div>
<header class="yla">
  <button type="button" class="yla-trigger" aria-label="メニューを開く">メニュー</button>
  <div class="yla-navi">
    <nav>
      <a href="#a">セクションA</a>
      <a href="#b">セクションB</a>
    </nav>
  </div>
</header>
<div class="yla-root">
  <main><!-- スクロールロックする本文 --></main>
</div>
```

ライブラリが付けるクラスの位置は次のとおりです。

- `yla-init` と `yla-active` は `.yla`
- `yla-scrolllocked` は `.yla-root`（`root` で別の要素を指定したときはその要素。見つからなければ `body`）
- `yla-scrolled`、`yla-scrolling-up`、`yla-scrolling-down` は `html`

```ts
const yla = new Yla(document.querySelector('.yla'), { breakpoint: 768 });
```

## yla-root

ドロワーを開いているあいだ、スクロールを止める対象です。`root` の既定セレクタで、`document` から探します。要素が無いときは `body` を使います。

ヘッダー（`.yla`）の外に置き、スクロールする本文を包みます。開くと `position: fixed` でその場に固定し、`yla-scrolllocked` を付けます。閉じるとスタイルを外し、開く前のスクロール位置に戻します。

`scrolllock: false` にすると固定しません。別の要素を止めるときは `root` にセレクタを渡します。

```ts
new Yla(document.querySelector('.yla'), { root: '.main' });
```

## オプション

省略したキーは次の既定値になります。

| キー | 型 | 既定値 | 内容 |
| --- | --- | --- | --- |
| `trigger` | `string` | `.yla-trigger` | 開閉ボタンのセレクタ。`document` から探す |
| `overlay` | `string` | `.yla-overlay` | オーバーレイのセレクタ。`document` から探す |
| `navi` | `string` | `.yla-navi` | 開閉するナビのセレクタ。コンテナ内から探す |
| `root` | `string` | `.yla-root` | スクロールロック対象のセレクタ。見つからなければ `body` |
| `breakpoint` | `number \| null` | `null` | この幅（px）以上でドロワー無効、未満で有効。`null` で常時有効 |
| `transition` | `'' \| 'none' \| 'fade' \| 'folding' \| 'fadeFolding' \| 'slideTop' \| 'slideBottom' \| 'slideLeft' \| 'slideRight'` | `fade` | 開閉アニメーション |
| `duration` | `number` | `600` | アニメーション時間（ms） |
| `scroll` | `{ over?: number \| (() => number); up?: number \| (() => number); down?: number \| (() => number) }` | `{ over: 200, up: 0, down: 0 }` | スクロール量の閾値。数値か、毎回評価する関数 |
| `scrolllock` | `boolean` | `true` | 開いているあいだスクロールを止める |

`scroll.over` を超えると `html` に `yla-scrolled` が付きます。`up` / `down` は、向きが変わってからその量だけ動いたときの判定に使います。

## メソッド

| メソッド | 内容 |
| --- | --- |
| `open(transition?)` | ドロワーを開く。引数があるとその回だけトランジションを差し替える |
| `close(transition?)` | ドロワーを閉じる。引数があるとその回だけトランジションを差し替える |
| `destroy()` | 閉じてからイベントを外し、インスタンスを破棄する |
| `isOpen` | 開いているか。読み取り専用 |

## イベント

コンテナ（`.yla`）で発火します。`on` で受けます。

```ts
yla.on('yla:afterOpen', () => {});
```

| イベント | タイミング |
| --- | --- |
| `yla:beforeOpen` | 開く処理の開始。オーバーレイを表示し、スクロールロックした直後 |
| `yla:afterOpen` | 開き終わったあと。フォーカストラップを付けた直後 |
| `yla:beforeClose` | 閉じる処理の開始。まだスクロールロック中 |
| `yla:afterClose` | 閉じ終わったあと。スクロールロック解除、フォーカストラップ解除、`blur` の直後 |
| `yla:open` | `yla:afterOpen` と同じタイミング。互換用 |
| `yla:close` | `yla:afterClose` と同じタイミング。互換用 |
| `yla:anchor` | ドロワー有効中に、ナビ内のページ内リンク（`href` が `#` で始まる `a`）をクリックしたとき。ドロワーも閉じる。コールバックにはその `MouseEvent` が渡る |
| `yla:leave` | コンテナからマウスが離れたとき |
| `yla:changeMediaQuery` | `breakpoint` を指定しているとき、その幅をまたいだあと。コールバックに渡る `CustomEvent` の `detail.event` が `MediaQueryListEvent` |
| `yla:scrolldown` | 下方向へ動き、`scroll.down` を超えたとき。向きが変わるまで一度だけ |
| `yla:scrollup` | 上方向へ動き、`scroll.up` を超えたとき。向きが変わるまで一度だけ |

## クラス

| クラス | 付く要素 | 意味 |
| --- | --- | --- |
| `yla-init` | `.yla` | コンストラクタ実行後。付くまで `.yla` は `yla.css` で非表示 |
| `yla-active` | `.yla` | ドロワーが有効な幅のとき |
| `yla-scrolled` | `html` | スクロール量が `scroll.over` を超えた |
| `yla-scrolling-up` | `html` | 上方向にスクロールしている |
| `yla-scrolling-down` | `html` | 下方向にスクロールしている |
| `yla-scrolllocked` | `.yla-root` | スクロールロック中。`yla.css` が `overflow: hidden` を付ける。`root` を変えたときはその要素。見つからなければ `body` |

## トランジション

`transition` と、`open` / `close` の引数に指定できます。

`fade` / `folding` / `fadeFolding` / `slideTop` / `slideBottom` / `slideLeft` / `slideRight` / `none`

空文字も指定できます。`none` はアニメーションなしです。
