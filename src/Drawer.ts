import Disclosure from './Disclosure';

type Options = {
  selectorTrigger?: string;
  selectorOverlay?: string;
  selectorContent?: string;
  breakpoint?: number | null;
  transition?: string;
  duration?: number;
};

export default class Drawer {
  // DOM
  private drawer: HTMLElement | null = null;
  private content: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private trigger: NodeListOf<HTMLElement>;
  private anchors: NodeListOf<HTMLAnchorElement> = [] as unknown as NodeListOf<HTMLAnchorElement>;
  private focusable: NodeListOf<HTMLElement> = [] as unknown as NodeListOf<HTMLElement>;

  // オブジェクト
  private disclosure: Disclosure;

  // コールバック
  private handleFocusTrap: (event: KeyboardEvent) => void = () => {};
  private handleClickOverlay: (event: MouseEvent) => void = () => {};
  private handleClickAnchor: (event: MouseEvent) => void = () => {};
  private handleKeydownEsc: (event: KeyboardEvent) => void = () => {};
  private handleChangeMediaQuery: (event: MediaQueryListEvent) => any = () => {};

  // ステータス
  private isInit: boolean = false;
  private isActive: boolean = false;
  private currentScrollY: number = 0;
  private mediaQuery: MediaQueryList | null = null;

  //オプション
  private optionsDefaut: Required<Options> = {
    selectorTrigger: '.drawer__trigger',
    selectorOverlay: '.drawer__overlay',
    selectorContent: '.drawer__content',
    breakpoint: null,

    transition: '',
    duration: 600,
  };
  private options: Required<Options>;

  constructor(container: HTMLElement | null, options?: Options) {
    this.options = Object.assign({}, this.optionsDefaut, options);

    this.drawer = container;
    this.overlay = document.querySelector<HTMLElement>(this.options.selectorOverlay);
    this.overlay ? (this.overlay.style.display = 'none') : null;

    this.content = document.querySelector<HTMLElement>(this.options.selectorContent);
    this.trigger = document.querySelectorAll<HTMLElement>(this.options.selectorTrigger);

    this.isInit = !!this.drawer && !!this.content && this.trigger.length > 0;

    if (!this.isInit) {
      throw new Error('Drawer: Not found element');
    }

    this.disclosure = new Disclosure(this.drawer, this.trigger, {
      onOpen: this.onOpen.bind(this),
      onClose: this.onClose.bind(this),
      transition: this.options.transition,
      // transition: 'none',
    });

    this.anchors = this.drawer!.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    this.focusable = this.drawer!.querySelectorAll<HTMLElement>('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');

    this.initializeEventHandlers();
    this.addEvents();
  }

  // ========== ========== ========== ========== ==========
  private initializeEventHandlers() {
    this.handleFocusTrap = this.focusTrap.bind(this);
    this.handleClickOverlay = this.clickOverlay.bind(this);
    this.handleClickAnchor = this.clickAnchor.bind(this);
    this.handleKeydownEsc = this.keydownEsc.bind(this);

    this.handleChangeMediaQuery = this.changeMediaQuery.bind(this);
  }

  private addEvents() {
    this.overlay?.addEventListener('click', this.handleClickOverlay);
    this.anchors.forEach((anchor) => {
      anchor.addEventListener('click', this.handleClickAnchor);
    });

    document.addEventListener('keydown', this.handleKeydownEsc);

    if (this.options.breakpoint) {
      this.mediaQuery = window.matchMedia(`(max-width: ${this.options.breakpoint}px)`);
      this.mediaQuery.addEventListener('change', this.handleChangeMediaQuery);
      this.changeMediaQuery({
        matches: this.mediaQuery.matches,
        media: this.mediaQuery.media,
      } as MediaQueryListEvent);
    } else {
      this.activate();
    }
  }

  private removeEvents() {
    this.overlay?.removeEventListener('click', this.handleClickOverlay);
    this.anchors.forEach((anchor) => {
      anchor.removeEventListener('click', this.handleClickAnchor);
    });

    document.removeEventListener('keydown', this.handleKeydownEsc);

    document.removeEventListener('keydown', this.handleFocusTrap);
  }

  private clickOverlay() {
    this.disclosure.close();
  }

  private clickAnchor(event: MouseEvent) {
    if (this.isActive) {
      this.disclosure.close();

      this.drawer!.dispatchEvent(new CustomEvent('drawer:anchor', { detail: { event } }));
    }
  }

  private keydownEsc(event: KeyboardEvent) {
    // Escキーで閉じる
    if (event.key === 'Escape' && this.isOpen) {
      this.disclosure.close();
    }
  }

  private changeMediaQuery(event: MediaQueryListEvent) {
    if (event.matches) {
      console.log(`Viewport <= ${this.options.breakpoint}px`);

      this.activate();
    } else {
      console.log(`Viewport > ${this.options.breakpoint}px`);

      if (this.isOpen) {
        this.disclosure.close('none').then(() => {
          this.deactivate();
        });
      } else {
        this.deactivate();
      }
    }

    this.drawer!.dispatchEvent(new CustomEvent('drawer:changeMediaQuery', { detail: { event } }));
  }

  // ---------- ----------

  private activate() {
    console.log('drawer: activate');
    this.isActive = true;
    this.drawer!.classList.add('is-active');
    this.disclosure.setDisabled(false);
  }

  private deactivate() {
    console.log('drawer: deactivate');
    this.close();
    this.isActive = false;
    this.drawer!.classList.remove('is-active');
    this.disclosure.setDisabled(true);

    this.drawer?.getAnimations().forEach((el) => {
      console.log('getAnimations');

      el.cancel();
    });

    // TODO: disclosureで、this.content.removeAttribute('aria-hidden'); しているが、メニューをsp、pcで使い回しているかどうかによって変わるかも。
  }

  // ---------- ----------
  anime: { [key: string]: Keyframe[] } = {
    fade: [{ opacity: '0' }, { opacity: '1' }],
    top: [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0%)' }],
    right: [{ transform: 'translateX(100%)' }, { transform: 'translateX(0%)' }],
    bottom: [{ transform: 'translateY(100%)' }, { transform: 'translateY(0%)' }],
    left: [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0%)' }],
  };

  private onOpen() {
    console.log('drawer: onOpen');

    this.scrollLock();
    document.addEventListener('keydown', this.handleFocusTrap);

    this.drawer!.dispatchEvent(new CustomEvent('drawer:open'));

    const animations: Promise<Animation>[] = [];
    if (this.overlay) {
      this.overlay.style.display = 'block';
      const overlayAnimation = this.overlay.animate(this.anime.fade, { duration: this.options.duration });
      animations.push(overlayAnimation.finished);
    }
  }

  private onClose(): Promise<void> {
    // Promiseで、アニメーション後に Disclosure を閉じる
    console.log('drawer: onClose');

    document.removeEventListener('keydown', this.handleFocusTrap);
    (document.activeElement as HTMLElement)?.blur();

    this.scrollUnlock();
    this.drawer!.dispatchEvent(new CustomEvent('drawer:close'));

    const animations: Promise<Animation>[] = [];
    if (this.overlay) {
      const keyframe = [...this.anime.fade].reverse();
      const overlayAnimation = this.overlay.animate(keyframe, { duration: this.options.duration });
      animations.push(overlayAnimation.finished);
    }

    if (animations) {
      return new Promise<void>((resolve) => {
        Promise.all(animations).then(() => {
          console.log('animations end overlay');
          this.overlay ? (this.overlay.style.display = 'none') : null;
          resolve();
        });
      });
    }

    return Promise.resolve();
  }

  // ---------- ----------
  private scrollLock() {
    // スクロール位置固定
    this.currentScrollY = window.scrollY;
    document.body.style.top = `-${this.currentScrollY}px`;
    document.body.classList.add('is-scrolllocked');
  }

  private scrollUnlock() {
    // スクロール位置復元
    document.body.style.top = '';
    document.body.classList.remove('is-scrolllocked');

    window.scrollTo(0, this.currentScrollY * -1);
  }

  private focusTrap(event: KeyboardEvent) {
    // フォーカスの移動をメニュー内に制限
    if (this.focusable.length > 0) {
      const focusableFirst = this.focusable[0];
      const focusableLast = this.focusable[this.focusable.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === focusableFirst) {
            event.preventDefault();
            focusableLast?.focus();
          }
        } else {
          if (document.activeElement === focusableLast) {
            event.preventDefault();
            focusableFirst?.focus();
          }
        }
      }
    } else {
      event.preventDefault();
    }
  }

  // ========== ========== ========== ========== ==========

  get isOpen() {
    return this.disclosure.isOpen;
  }

  open() {
    if (!this.isOpen) {
      this.disclosure.open().then(() => {
        console.log('o-p-e-n');
      });
    }
  }

  close() {
    if (this.isOpen) {
      this.disclosure.close().then(() => {});
    }
  }

  on(event: string, callback: (event: Event) => void) {
    if (event === 'drawer:anchor' || event === 'drawer:changeMediaQuery') {
      this.drawer!.addEventListener(event, (ev: Event) => {
        const customEvent = ev as CustomEvent;
        callback(customEvent.detail.event);
      });
    } else if (event === 'drawer:changeMediaQuery') {
      this.drawer!.addEventListener(event, (ev: Event) => {
        callback(ev as MediaQueryListEvent);
      });
    } else {
      this.drawer!.addEventListener(event, callback);
    }
  }

  destroy() {
    this.close();

    this.removeEvents();
    this.drawer = null;
    this.content = null;
    this.overlay = null;
    this.trigger = undefined as unknown as NodeListOf<HTMLElement>;
    this.anchors = undefined as unknown as NodeListOf<HTMLAnchorElement>;
    this.focusable = undefined as unknown as NodeListOf<HTMLElement>;

    this.disclosure.destroy();
  }
}
