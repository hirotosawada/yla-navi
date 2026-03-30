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

  /** HTML の aria-hidden があれば解釈し、なければ閉じた状態として true を付与する。 */
  private applyInitialAriaFromContent() {
    const raw = this.content.getAttribute('aria-hidden');
    if (raw === null) {
      this.content.setAttribute('aria-hidden', 'true');
      this._isOpen = false;
      return;
    }
    const v = raw.trim().toLowerCase();
    if (v === 'false') {
      this._isOpen = true;
      return;
    }
    this._isOpen = false;
    if (v !== 'true') {
      this.content.setAttribute('aria-hidden', 'true');
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

      this._isClosing = false;
      this._isOpening = true;
      this._isAnimating = true;
      this.triggers.forEach((trigger) => {
        trigger.setDisabled(true);
      });

      const handleOpen = () => {
        this._isAnimating = false;
        this.triggers.forEach((trigger) => {
          trigger.setDisabled(false);
        });

        this.content.dispatchEvent(new CustomEvent('disclosure:open'));
        this.options.onAfterOpen?.();
      };

      return new Promise<void>((resolve) => {
        this.options.onBeforeOpen?.();
        this.content.setAttribute('aria-hidden', 'false');
        this._isOpen = true;
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
              this._isOpening = false;
              handleOpen();
              this.resetAnime();
              resolve();
            })
            .catch(() => {
              resolve();
            });
        } else {
          this._animation?.cancel();
          handleOpen();
          resolve();
        }
      });
    }

    return Promise.resolve();
  }

  close(transition?: DisclosureTransitionType, duration: number = this.options.duration ?? 500): Promise<void> {
    const durationMs = Math.max(0, duration);
    const t = transition ?? this.options.transition ?? 'fade';
    if (this._isOpen && !this._isClosing) {
      if (this._isAnimating && this._animation) {
        // this._animation.finish();
        this._animation.pause();
      }

      this._isClosing = true;
      this._isOpening = false;

      this._isAnimating = true;
      this.triggers.forEach((trigger) => {
        trigger.setDisabled(true);
      });

      const handleClose = () => {
        this._isOpen = false;
        this.content.setAttribute('aria-hidden', 'true');

        this._isAnimating = false;
        this.triggers.forEach((trigger) => {
          trigger.setDisabled(false);
        });

        this.content.dispatchEvent(new CustomEvent('disclosure:close'));
        this.options.onAfterClose?.();
      };

      return new Promise<void>((resolve) => {
        this.options.onBeforeClose?.();

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
              this._isClosing = false;

              handleClose();
              this.resetAnime();

              resolve();
            })
            .catch(() => {
              resolve();
            });
        } else {
          this._animation?.cancel();
          handleClose();
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
    } else {
      this.content.setAttribute('aria-hidden', this._isOpen ? 'false' : 'true');
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
