/** Disclosure で利用できるトランジション名。open/close の引数やオプションで指定する。 */
export type DisclosureTransitionType = '' | 'none' | 'fade' | 'folding' | 'fadeFolding' | 'slideTop' | 'slideBottom' | 'slideLeft' | 'slideRight';

/** 利用可能なトランジション一覧（UIのセレクト候補やドキュメント用）。 */
export const DISCLOSURE_TRANSITION_TYPES: readonly DisclosureTransitionType[] = ['', 'none', 'fade', 'folding', 'fadeFolding', 'slideTop', 'slideBottom', 'slideLeft', 'slideRight'] as const;

export interface DisclosureOptions {
  click?: boolean;
  focus?: boolean;
  enter?: boolean;
  leave?: boolean;
  onBeforeOpen?: () => void;
  onAfterOpen?: () => void;
  onBeforeClose?: () => void;
  onAfterClose?: () => void;

  transition?: DisclosureTransitionType;
  duration?: number;
}

export interface TriggerOptions {
  onClick?: (event: MouseEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;

  click?: boolean;
  focus?: boolean;
  enter?: boolean;
}

export interface ValikkoItemOptions extends DisclosureOptions {
  item?: string;
  /** 開閉のきっかけになる要素のセレクタ（.valikko-trigger など）。 */
  trigger?: string;
  child?: string;

  isCloseChildren?: boolean;
  isCloseSiblings?: boolean;
}

/** トップ階層とネストで別々に指定するときの形。 */
export interface ValikkoTransitionTopUnder {
  top?: DisclosureTransitionType;
  under?: DisclosureTransitionType;
}

/** 全階層同じなら文字列、トップとネストで分けたいなら { top, under }。 */
export type ValikkoTransitionOption = DisclosureTransitionType | ValikkoTransitionTopUnder;

/** breakpoints[minWidth] = その幅(px)以上で適用するオプション。Swiper と同様、幅の小さい順にマージされる。 */
export type ValikkoBreakpoints = Record<number, Partial<Omit<ValikkoOptions, 'breakpoints'>>>;

export interface ValikkoOptions extends Omit<ValikkoItemOptions, 'transition'> {
  /** 省略時は 'folding'。{ top, under } で階層ごとに指定可能。 */
  transition?: ValikkoTransitionOption;
  /**
   * レスポンシブ用。key = minWidth(px)。viewport が key 以上のときそのオプションをマージ（小さい key から順に適用）。
   * 例: breakpoints: { 0: { click: true }, 768: { enter: true, leave: true } }
   */
  breakpoints?: ValikkoBreakpoints;
}

/** `scroll.over` / `up` / `down` に渡せる、固定値または毎回評価する閾値。 */
export type YlaScrollThreshold = number | (() => number);

export interface YlaOptions {
  /** 開閉トリガー要素のセレクタ。省略時 '.yla-trigger' */
  selectorTrigger?: string;
  /** オーバーレイ要素のセレクタ。省略時 '.yla-overlay' */
  selectorOverlay?: string;
  /** 開閉対象のナビ要素のセレクタ。container 内で探し、無ければ container を使用。省略時 '.yla-navi' */
  selectorNavi?: string;
  /** この幅(px)以上でドロワー無効、未満で有効。min-width で判定（Valikko の breakpoints と同一基準）。null で常時有効。 */
  breakpoint?: number | null;
  /** 開閉時のトランジション種別 */
  transition?: DisclosureTransitionType;
  /** アニメーション時間（ms） */
  duration?: number;
  /**
   * スクロール量に応じたクラス付与の閾値（over: この値超で yla-scrolled など）。
   * 各キーは数値か、都度評価する関数（ビューポートやブレークポイントに応じたチューニング用）。
   */
  scroll?: {
    over?: YlaScrollThreshold;
    up?: YlaScrollThreshold;
    down?: YlaScrollThreshold;
  };
  /**
   * ドロワー表示中にスクロールを止める対象要素。`getBoundingClientRect` と `position: fixed` で固定する。
   * `null` のときはロックしない。省略時は `document.body`。
   */
  scrollLockTarget?: HTMLElement | null;
}
