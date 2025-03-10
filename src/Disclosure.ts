import {
 FadeTransition, FoldingTransition, SlideBottomTransition, SlideLeftTransition,
 SlideRightTransition, SlideTopTransition, Transition
} from './Transition';
import Trigger from './Trigger';
import { DisclosureOptions } from './type';

export default class Disclosure {
  id: string;
  content: HTMLElement;
  triggers: Trigger[] = [];

  // コールバック
  protected handleOnLeave: (event: MouseEvent) => void;

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
    onOpen: () => {},
    onClose: () => {},

    transition: 'fade',
    duration: 400,
  };

  anime: { [key: string]: Keyframe[] } = {
    top: [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0%)' }],
    right: [{ transform: 'translateX(100%)' }, { transform: 'translateX(0%)' }],
    bottom: [{ transform: 'translateY(100%)' }, { transform: 'translateY(0%)' }],
    left: [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0%)' }],
  };

  private _animation: Animation | null = null;

  constructor(content: HTMLElement | null, triggers: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement> | null, options: DisclosureOptions = {}) {
    // console.log('Disclosure class initialized');

    if (!content) {
      throw new Error('Disclosure: Missing content');
    }

    if (!triggers) {
      throw new Error('Disclosure: Missing triggers');
    }

    this.options = { ...this.options, ...options };
    // ---------- ---------- ---------- ---------- ----------
    // contentの初期化
    this.content = content;
    this.id = content.id || `disclosure-${Math.random().toString(36).substring(2, 11)}`;
    this.content.setAttribute('id', this.id);
    this.content.setAttribute('aria-hidden', 'true');

    this.handleOnLeave = this.onLeave.bind(this);
    this.content.addEventListener('mouseleave', this.handleOnLeave);

    // ---------- ---------- ---------- ---------- ----------
    // triggersの初期化
    if (triggers instanceof NodeList) {
      triggers = Array.from(triggers);
    } else if (triggers instanceof HTMLElement) {
      triggers = [triggers];
    }
    triggers.forEach((trigger) => {
      this.triggers.push(this.initTrigger(trigger));
    });
  }
  // ========== ========== ========== ========== ==========
  // Private methods
  private onLeave() {
    // console.log('content: mouseleave', this.options.leave);
    if (this._isAnimating || !this.options.leave) {
      return;
    }

    this.close();
  }

  private initTrigger(trigger: HTMLElement): Trigger {
    const callbacks = {
      onClick: (event: MouseEvent) => {
        event.preventDefault();
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

  private createTransitionInstance(type: string): Transition | null {
    // console.log(type);

    switch (type) {
      case 'fade':
        return new FadeTransition(this.content);
      case 'folding':
        return new FoldingTransition(this.content);
      case 'slideTop':
        return new SlideTopTransition(this.content);
      case 'slideBottom':
        return new SlideBottomTransition(this.content);
      case 'slideLeft':
        return new SlideLeftTransition(this.content);
      case 'slideRight':
        return new SlideRightTransition(this.content);
      case 'none':
        return null;
      default:
        return new FadeTransition(this.content);
    }
  }

  private removeStyles() {
    // this.content.removeAttribute('style');
    this.content.style.transform = '';
    this.content.style.opacity = '';
    this.content.style.height = '';
  }

  resetAnime() {
    this.removeStyles();
    this._animation?.commitStyles();
    this._animation?.cancel();
    this.removeStyles();
  }

  // ========== ========== ========== ========== ==========
  // Public methods
  open(transition: string = this.options.transition || 'fade', duration: number = this.options.duration || 500): Promise<void> {
    if (!this._isOpen && !this._isOpening) {
      // console.log('Disclosure open', transition, duration);

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
      };

      return new Promise<void>((resolve) => {
        this.options.onOpen?.();
        this.content.setAttribute('aria-hidden', 'false');
        this._isOpen = true;
        this.triggers.forEach((trigger) => {
          trigger.setExpanded(true);
        });

        const transitionInstance = this.createTransitionInstance(this.options.transition ?? 'none');
        if (transitionInstance) {
          const keyframes = transitionInstance.getKeyframesOpen();

          transitionInstance.beforeOpen();
          this._animation = this.content!.animate(keyframes, { duration: duration, easing: 'ease-in-out', fill: 'forwards' });
          this._animation.finished
            .then(() => {
              // console.log('open end');
              transitionInstance.afterOpen();
              this._isOpening = false;
              handleOpen();
              resolve();
            })
            .catch(() => {
              // console.log('open stop');
              // transitionInstance.afterOpen();
              resolve();
            });
        } else {
          handleOpen();
          resolve();
        }
      });
    }

    return Promise.resolve();
  }

  close(transition: string = this.options.transition || 'fade', duration: number = this.options.duration || 500): Promise<void> {
    if (this._isOpen && !this._isClosing) {
      // console.log('Disclosure close', transition, this.options.transition, duration, this.id);

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
        this.triggers.forEach((trigger) => {
          trigger.setExpanded(false);
        });

        this._isAnimating = false;
        this.triggers.forEach((trigger) => {
          trigger.setDisabled(false);
        });

        this.content.dispatchEvent(new CustomEvent('disclosure:close'));
      };

      return new Promise<void>((resolve) => {
        this.options.onClose?.();

        const transitionInstance = this.createTransitionInstance(this.options.transition ?? 'none');
        if (transitionInstance) {
          const keyframes = transitionInstance.getKeyframesClose();

          transitionInstance.beforeClose();
          this._animation = this.content!.animate(keyframes, { duration: duration, easing: 'ease-in-out', fill: 'forwards' });
          this._animation.finished
            .then(() => {
              // console.log('close end');
              transitionInstance.afterClose();
              this._isClosing = false;

              handleClose();
              resolve();
            })
            .catch(() => {
              // console.log('close stop');
              // transitionInstance.afterClose();
              resolve();
            });
        } else {
          handleClose();
        }
      });
    }

    return Promise.resolve();
  }

  toggle() {
    // console.log('Disclosure toggle');
    this._isOpen ? this.close() : this.open();
  }

  addTrigger(trigger: HTMLElement) {
    // console.log('Disclosure addTrigger');
    this.triggers.push(this.initTrigger(trigger));
  }

  on(event: 'onOpen' | 'onClose', callback: () => void) {
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

    // this.content.getAnimations().forEach((element) => {
    //   element.cancel();
    // });

    this.resetAnime();

    this.triggers.forEach((trigger) => {
      trigger.setOptions({
        click: this.options.click,
        focus: this.options.focus,
        enter: this.options.enter,
      });
    });
  }

  destroy() {
    // console.log('Disclosure destroy');

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
