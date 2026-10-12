# Valikko

多段のドロップダウン／アコーディオンです。コンテナの中にある `.valikko-item` を集め、トリガーと子メニューで開閉します。

コンテナが `null` のときは `Valikko: Missing container` を投げて初期化しません。

## マークアップ

コンストラクタに渡す要素がコンテナです。各項目は `.valikko-item`、開閉のきっかけは `.valikko-trigger`、子メニューは `.valikko-child` です。子が無い項目はトリガーだけになります。

```html
<ul class="valikko">
  <li class="valikko-item">
    <a href="#" class="valikko-trigger">メニュー1</a>
    <div class="valikko-child">
      <ul>
        <li class="valikko-item">
          <a href="#" class="valikko-trigger">メニュー1-1</a>
        </li>
        <li class="valikko-item">
          <a href="#" class="valikko-trigger">メニュー1-2</a>
          <div class="valikko-child">
            <ul>
              <li class="valikko-item">
                <a href="#" class="valikko-trigger">メニュー1-2-1</a>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </li>
  <li class="valikko-item">
    <a href="#" class="valikko-trigger">メニュー2</a>
  </li>
</ul>
```

```ts
const valikko = new Valikko(document.querySelector('.valikko'));
```

## オプション

省略したキーは次の既定値になります。既定ではクリックでは開かず、マウスエンターとフォーカスで開きます。

| キー | 型 | 既定値 | 内容 |
| --- | --- | --- | --- |
| `item` | `string` | `.valikko-item` | 項目のセレクタ |
| `trigger` | `string` | `.valikko-trigger` | 開閉のきっかけになる要素 |
| `child` | `string` | `.valikko-child` | 子メニュー |
| `transition` | `'' \| 'none' \| 'fade' \| 'folding' \| 'fadeFolding' \| 'slideTop' \| 'slideBottom' \| 'slideLeft' \| 'slideRight' \| { top?: '' \| 'none' \| 'fade' \| 'folding' \| 'fadeFolding' \| 'slideTop' \| 'slideBottom' \| 'slideLeft' \| 'slideRight'; under?: '' \| 'none' \| 'fade' \| 'folding' \| 'fadeFolding' \| 'slideTop' \| 'slideBottom' \| 'slideLeft' \| 'slideRight' }` | `folding` | 開閉アニメーション。文字列か `{ top, under }` |
| `duration` | `number` | `400` | アニメーション時間（ms） |
| `click` | `boolean` | `false` | クリックで開閉する |
| `focus` | `boolean` | `true` | フォーカスで開く |
| `enter` | `boolean` | `true` | マウスエンターで開く |
| `leave` | `boolean` | `true` | メニューから出たら閉じる |
| `isCloseChildren` | `boolean` | `true` | 閉じるとき子孫も閉じる |
| `isCloseSiblings` | `boolean` | `true` | 開くとき同じ階層の兄弟を閉じる |
| `onBeforeOpen` | `() => void` | なし | 項目が開く直前。引数はない |
| `onAfterOpen` | `() => void` | なし | 項目が開き終わったとき。引数はない |
| `onBeforeClose` | `() => void` | なし | 項目が閉じる直前。引数はない |
| `onAfterClose` | `() => void` | なし | 項目が閉じ終わったとき。引数はない |
| `breakpoints` | `{ [minWidth: number]: Partial<Omit<ValikkoOptions, 'breakpoints'>> }` | なし | 幅ごとのオプション。下記 |

### breakpoints

キーはその幅（px）以上で適用するオプションです。小さいキーから順に、ベースのオプションへマージします。

狭い幅ではクリック、768px 以上ではホバーとフォーカス、という指定例です。

```ts
new Valikko(document.querySelector('.valikko'), {
  click: true,
  enter: false,
  leave: false,
  breakpoints: {
    768: {
      enter: true,
      leave: true,
      transition: { top: 'fade', under: 'folding' },
    },
  },
});
```

### transition の top と under

文字列を渡すと全階層が同じアニメーションです。`{ top, under }` にすると、トップ階層とネストで分けられます。片方だけ書いたときは、書いた側がもう一方のフォールバックになり、どちらも無いときは `folding` です。

```ts
new Valikko(container, {
  transition: { top: 'fade', under: 'folding' },
});
```

使える名前は Yla と同じです。`fade` / `folding` / `fadeFolding` / `slideTop` / `slideBottom` / `slideLeft` / `slideRight` / `none`。空文字も指定できます。

## メソッド

| メソッド | 内容 |
| --- | --- |
| `open(transition?)` | サブメニューをすべて開く。`isCloseSiblings` が `true` だと、同じ階層では最後の項目だけが開いた状態になる。引数があるとその回だけトランジションを差し替える |
| `close(transition?)` | 開いているサブメニューをすべて閉じる。引数があるとその回だけトランジションを差し替える |
| `destroy()` | イベントを外し、項目を破棄する |

## イベント

開閉のコールバックはオプションで渡します。項目ごとに、その項目が開閉するときに呼ばれます。引数はないので、どの項目かは分かりません。

子メニュー（`.valikko-child`）では `disclosure:open` と `disclosure:close` も発火します。バブルしないので、子メニュー要素で聞きます。

```ts
child.addEventListener('disclosure:open', () => {});
```

| イベント | タイミング |
| --- | --- |
| `onBeforeOpen` | 開く処理の開始。アニメーションの前 |
| `onAfterOpen` | 開き終わったあと |
| `disclosure:open` | `.valikko-child` で、`onAfterOpen` の直後 |
| `onBeforeClose` | 閉じる処理の開始。アニメーションの前 |
| `onAfterClose` | 閉じ終わったあと。子メニューは `display: none` |
| `disclosure:close` | `.valikko-child` で、`onAfterClose` の直後 |

### 改善予定

`valikko.on` で受ける形に変えます。発火場所はコンテナで、名前は `valikko:beforeOpen` / `valikko:afterOpen` / `valikko:beforeClose` / `valikko:afterClose` です。`detail.item` に `.valikko-item`、`detail.content` に `.valikko-child` が渡ります。`onBeforeOpen` などのコールバックと `disclosure:*` は外します。

## クラス

マークアップに書くクラスです。ライブラリは開閉用のクラスを付けません。

| クラス | 付く要素 | 意味 |
| --- | --- | --- |
| `.valikko-item` | 各項目 | メニュー項目。コンテナの中から集める |
| `.valikko-trigger` | 項目の中 | 開閉のきっかけ。子が無い項目はこれだけ |
| `.valikko-child` | 項目の中 | 子メニュー |

開いているかはクラスではなく、次の属性です。

| 属性 | 付く要素 | 意味 |
| --- | --- | --- |
| `aria-expanded` | `.valikko-trigger` | 開いているとき `true`、閉じているとき `false` |
| `aria-hidden` | `.valikko-child` | 閉じているとき `true`。初期値が `false` なら開いた状態で始まる |

アニメーション中はトリガーに `disabled` が付きます。
