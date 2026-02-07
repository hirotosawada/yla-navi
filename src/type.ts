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

export interface ValikkoOptions extends Omit<ValikkoItemOptions, 'transition'> {
  /** 省略時は 'folding'。{ top, under } で階層ごとに指定可能。 */
  transition?: ValikkoTransitionOption;
}

export interface YlaOptions {
  selectorTrigger?: string;
  selectorOverlay?: string;
  selectorContent?: string;
  breakpoint?: number | null;
  transition?: DisclosureTransitionType;
  duration?: number;
  scroll?: {
    over?: number;
    up?: number;
    down?: number;
  };
}
