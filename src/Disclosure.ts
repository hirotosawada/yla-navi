import {
 FadeFoldingTransition, FadeTransition, FoldingTransition, SlideBottomTransition,
 SlideLeftTransition, SlideRightTransition, SlideTopTransition, Transition
} from './Transition';
import Trigger from './Trigger';
import { DisclosureOptions, DisclosureTransitionType } from './type';

export default class Disclosure {
  id: string;
  content: HTMLElement;
  triggers: Trigger[] = [];

  // コールバック
  protected handleOnLeave: (event: MouseEvent) => void;
  protected handleOnFocusout: (event: FocusEvent) => void;

  // ステータス
  private _isOpen: boolean = false;
  private _isAnimating: boolean = false;
  private _isClosing: boolean = false;
  private _isOpening: boolean = false;

  //オプション
  options: DisclosureOptions = {
    click: true,
    focus: false,
    enter: false,
    leave: false,
    onBeforeOpen: () => {},
    onAfterOpen: () => {},
    onBeforeClose: () => {},
    onAfterClose: () => {},

    transition: 'fade',
    duration: 400,
  };

  private _animation: Animation | null = null;

  constructor(content: HTMLElement | null, triggers: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement> | null, options: DisclosureOptions = {}) {
    if (!content) {
      throw new Error('Disclosure: Missing content');
    }

    if (!triggers) {
      // throw new Error('Disclosure: Missing triggers');
    }

    this.options = { ...this.options, ...options };
    // ---------- ---------- ---------- ---------- ----------
    // contentの初期化
    this.content = content;
    this.id = content.id || `disclosure-${Math.random().toString(36).substring(2, 11)}`;
    this.content.setAttribute('id', this.id);
    this.applyInitialAriaFromContent();

    this.handleOnLeave = this.onLeave.bind(this);
    this.content.addEventListener('mouseleave', this.handleOnLeave);
    this.handleOnFocusout = this.onFocusout.bind(this);
    this.content.addEventListener('focusout', this.handleOnFocusout);

    // ---------- ---------- ---------- ---------- ----------
    // triggersの初期化
    if (triggers instanceof NodeList) {
      triggers = Array.from(triggers);
    } else if (triggers instanceof HTMLElement) {
      triggers = [triggers];
    }
    triggers?.forEach((trigger) => {
      this.triggers.push(this.initTrigger(trigger));
    });

    if (this._isOpen) {
      this.triggers.forEach((trigger) => {
        trigger.setExpanded(true);
      });
    }
  }

  /**
   * コンストラクタ時に、`content` の `aria-hidden` を読み `_isOpen` と `style.display` を初期化する。
   *
   * - 属性なし: `aria-hidden="true"` を付与し、閉じた扱い（`display: none`）。
   * - `"false"`（前後の空白は無視、大文字小文字は無視）: 開いた扱い（`display` は空文字で既定の表示に委ねる）。
   * - `"true"`: 閉じた扱い（`display: none`）。属性はそのまま。
   * - 上記以外の不正な値: `aria-hidden="true"` に正規化し、閉じた扱い（`display: none`）。
   */
  private applyInitialAriaFromContent() {
    const initialAria = this.content.getAttribute('aria-hidden');
    if (initialAria === null) {
      this.content.setAttribute('aria-hidden', 'true');
      this._isOpen = false;
      this.content.style.display = 'none';
      return;
    }
    const initialAriaValue = initialAria.trim().toLowerCase();
    if (initialAriaValue === 'false') {
      this._isOpen = true;
      this.content.style.display = '';
      return;
    } else if (initialAriaValue !== 'true') {
      // 値が不正な場合は true を付与して閉じた状態とする
      this.content.setAttribute('aria-hidden', 'true');
      this._isOpen = false;
      this.content.style.display = 'none';
      return;
    } else {
      this._isOpen = false;
      this.content.style.display = 'none';
    }
  }

  // ========== ========== ========== ========== ==========
  // Private methods
  private onLeave() {
    if (this._isAnimating || !this.options.leave) {
      return;
    }

    this.close();
  }

  private onFocusout(ev: FocusEvent) {
    if (ev.relatedTarget && !this.content.contains(ev.relatedTarget as Node)) {
      // フォーカスが container の外へ出た
    }
  }

  private initTrigger(trigger: HTMLElement): Trigger {
    const callbacks = {
      onClick: () => {
        this.toggle();
      },
      onFocus: () => {
        this.open();
      },
      onMouseEnter: () => {
        this.open();
      },
    };

    return new Trigger(this.id, trigger, { ...callbacks, click: this.options.click, focus: this.options.focus, enter: this.options.enter });
  }

  private createTransitionInstance(type: DisclosureTransitionType): Transition | null {
    switch (type) {
      case 'fade':
        return new FadeTransition(this.content);
      case 'folding':
        return new FoldingTransition(this.content);
      case 'fadeFolding':
        return new FadeFoldingTransition(this.content);
      case 'slideTop':
        return new SlideTopTransition(this.content);
      case 'slideBottom':
        return new SlideBottomTransition(this.content);
      case 'slideLeft':
        return new SlideLeftTransition(this.content);
      case 'slideRight':
        return new SlideRightTransition(this.content);
      case 'none':
      case '':
        return null;
      default:
        console.warn('Disclosure: unknown transition type', type);
        return null;
    }
  }

  private removeStyles() {
    // this.content.removeAttribute('style');
    this.content.style.transform = '';
    this.content.style.opacity = '';
    this.content.style.height = '';
  }

  resetAnime(isKeepStyle: boolean = false) {
    this.removeStyles();
    this._animation?.commitStyles();
    this._animation?.cancel();

    if (!isKeepStyle) {
      this.removeStyles();
    }
  }

  // ========== ========== ========== ========== ==========
  // Public methods
  open(transition?: DisclosureTransitionType, duration: number = this.options.duration ?? 500): Promise<void> {
    const durationMs = Math.max(0, duration);
    const t = transition ?? this.options.transition ?? 'fade';

    if (!this._isOpen && !this._isOpening) {
      if (this._isAnimating && this._animation) {
        this._animation.pause();
      }

      const handleAfterOpen = () => {
        this._isOpening = false;
        this._isAnimating = false;

        // トリガーを有効化
        this.triggers.forEach((trigger) => {
          trigger.setDisabled(false);
        });

        // コールバック実行
        this.options.onAfterOpen?.();

        // イベント発火
        this.content.dispatchEvent(new CustomEvent('disclosure:open'));
      };

      return new Promise<void>((resolve) => {
        // 処理中はトリガーを無効化
        this.triggers.forEach((trigger) => {
          trigger.setDisabled(true);
        });

        // コールバック実行
        this.options.onBeforeOpen?.();

        // 開閉ステータス更新
        this._isClosing = false;
        this._isOpening = true;
        this._isAnimating = true;
        this._isOpen = true;
        this.content.setAttribute('aria-hidden', 'false');
        this.content.style.display = ''; // 初期値はブラウザ依存
        this.triggers.forEach((trigger) => {
          trigger.setExpanded(true);
        });

        const transitionInstance = this.createTransitionInstance(t);
        if (transitionInstance) {
          const keyframes = transitionInstance.getKeyframesOpen();

          transitionInstance.beforeOpen();
          this._animation?.cancel();
          this._animation = this.content!.animate(keyframes, { duration: durationMs, easing: 'ease-in-out', fill: 'forwards' });
          this._animation.finished
            .then(() => {
              transitionInstance.afterOpen();
              handleAfterOpen();
              this.resetAnime();
              resolve();
            })
            .catch(() => {
              resolve();
            });
        } else {
          this._animation?.cancel();
          handleAfterOpen();
          resolve();
        }
      });
    }

    //
    return Promise.resolve();
  }

  close(transition?: DisclosureTransitionType, duration: number = this.options.duration ?? 500): Promise<void> {
    const durationMs = Math.max(0, duration);
    const t = transition ?? this.options.transition ?? 'fade';

    if (this._isOpen && !this._isClosing) {
      if (this._isAnimating && this._animation) {
        this._animation.pause();
      }

      const handleAfterClose = () => {
        this._isOpen = false;
        this._isClosing = false;
        this._isAnimating = false;
        this.content.setAttribute('aria-hidden', 'true');
        this.content.style.display = 'none';

        // トリガーを有効化
        this.triggers.forEach((trigger) => {
          trigger.setDisabled(false);
        });

        // コールバック実行
        this.options.onAfterClose?.();

        // イベント発火
        this.content.dispatchEvent(new CustomEvent('disclosure:close'));
      };

      return new Promise<void>((resolve) => {
        // 処理中はトリガーを無効化
        this.triggers.forEach((trigger) => {
          trigger.setDisabled(true);
        });

        // コールバック実行
        this.options.onBeforeClose?.();

        // 開閉ステータス更新
        this._isClosing = true;
        this._isOpening = false;
        this._isAnimating = true;
        this.triggers.forEach((trigger) => {
          trigger.setExpanded(false);
        });

        const transitionInstance = this.createTransitionInstance(t);
        if (transitionInstance) {
          const keyframes = transitionInstance.getKeyframesClose();

          transitionInstance.beforeClose();
          this._animation?.cancel();
          this._animation = this.content!.animate(keyframes, { duration: durationMs, easing: 'ease-in-out', fill: 'forwards' });
          this._animation.finished
            .then(() => {
              transitionInstance.afterClose();
              handleAfterClose();
              this.resetAnime();
              resolve();
            })
            .catch(() => {
              resolve();
            });
        } else {
          this._animation?.cancel();
          handleAfterClose();
          resolve();
        }
      });
    }

    return Promise.resolve();
  }

  toggle() {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  addTrigger(trigger: HTMLElement) {
    this.triggers.push(this.initTrigger(trigger));
  }

  on(event: 'onBeforeOpen' | 'onAfterOpen' | 'onBeforeClose' | 'onAfterClose', callback: () => void) {
    this.options[event] = callback;
  }

  setDisabled(isDisabled: boolean) {
    if (isDisabled) {
      this.content.removeAttribute('aria-hidden');
      this.content.style.display = '';
    } else {
      this.content.setAttribute('aria-hidden', this._isOpen ? 'false' : 'true');
      this.content.style.display = this._isOpen ? '' : 'none';
    }

    this.triggers.forEach((trigger) => {
      trigger.setDisabled(isDisabled);
    });
  }

  setOptions(options: DisclosureOptions) {
    this.options = { ...this.options, ...options };

    // this.resetAnime();

    this.triggers.forEach((trigger) => {
      trigger.setOptions({
        click: this.options.click,
        focus: this.options.focus,
        enter: this.options.enter,
      });
    });
  }

  destroy() {
    // commitStyles() は要素が未描画だと InvalidStateError を投げるため、破棄時は cancel とスタイル削除のみ行う
    this._animation?.cancel();
    this.removeStyles();
    this._animation = null;

    this.content.removeAttribute('id');
    this.content.removeAttribute('aria-hidden');
    this.content.style.display = '';

    if (this.options.leave) {
      this.content.removeEventListener('mouseleave', this.handleOnLeave);
      this.handleOnLeave = () => {};
    }

    this.triggers.forEach((trigger) => {
      trigger.destroy();
    });
    this.triggers = [];
  }

  get isOpen() {
    return this._isOpen;
  }
}
