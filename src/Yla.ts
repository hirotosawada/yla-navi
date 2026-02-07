import Disclosure from './Disclosure';
import { YlaOptions, DisclosureTransitionType } from './type';

/**
 * ドロワー／オーバーレイナビゲーション（正式名: Ylä）
 */
export default class Yla {
  // DOM
  private container: HTMLElement | null = null;
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
  private handleChangeMediaQuery: (event: MediaQueryListEvent) => void = () => {};
  private handleOnScroll: () => void = () => {};

  // ステータス
  private isInit: boolean = false;
  private isActive: boolean = false;
  private currentScrollY: number = 0;
  private mediaQuery: MediaQueryList | null = null;

  // 他
  private scrollBuffer: number = 0;
  private scrollLast: number = 0;
  private scrollTicking: boolean = false; // 余計な処理を抑制するフラグ
  private scrollDirection: number = 1; // up: 1, down: -1
  private scrollEventFired: boolean = false;

  //オプション
  private optionsDefault: Required<YlaOptions> = {
    selectorTrigger: '.yla-trigger',
    selectorOverlay: '.yla-overlay',
    selectorContent: '.yla-content',
    breakpoint: null,

    transition: '',
    duration: 600,
    scroll: { over: 200, up: 0, down: 0 },
  };
  private options: Required<YlaOptions>;

  constructor(container: HTMLElement | null, options?: YlaOptions) {
    this.options = Object.assign({}, this.optionsDefault, options);

    this.container = container;
    this.container?.classList.add('yla-init');
    this.overlay = document.querySelector<HTMLElement>(this.options.selectorOverlay);
    this.overlay ? (this.overlay.style.display = 'none') : null;

    this.content = document.querySelector<HTMLElement>(this.options.selectorContent);
    this.trigger = document.querySelectorAll<HTMLElement>(this.options.selectorTrigger);

    this.isInit = !!this.container && !!this.content && this.trigger.length > 0;

    if (!this.isInit) {
      throw new Error('Yla: Not found element');
    }

    this.disclosure = new Disclosure(this.container, this.trigger, {
      onBeforeOpen: this.onBeforeOpen.bind(this),
      onAfterOpen: this.onAfterOpen.bind(this),
      onBeforeClose: this.onBeforeClose.bind(this),
      onAfterClose: this.onAfterClose.bind(this),
      transition: this.options.transition,
      duration: this.options.duration,
    });

    this.anchors = this.container!.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    this.focusable = this.container!.querySelectorAll<HTMLElement>('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');

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

    this.handleOnScroll = this.onScroll.bind(this);
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
      this.changeMediaQuery({ matches: this.mediaQuery.matches, media: this.mediaQuery.media } as MediaQueryListEvent);
    } else {
      this.activate();
    }

    window.addEventListener('scroll', this.handleOnScroll);
  }

  private removeEvents() {
    this.overlay?.removeEventListener('click', this.handleClickOverlay);
    this.anchors.forEach((anchor) => {
      anchor.removeEventListener('click', this.handleClickAnchor);
    });

    document.removeEventListener('keydown', this.handleKeydownEsc);

    document.removeEventListener('keydown', this.handleFocusTrap);

    window.removeEventListener('scroll', this.handleOnScroll);
  }

  private clickOverlay() {
    this.close();
  }

  private clickAnchor(event: MouseEvent) {
    if (this.isActive) {
      this.close();

      this.container!.dispatchEvent(new CustomEvent('yla:anchor', { detail: { event } }));
    }
  }

  private keydownEsc(event: KeyboardEvent) {
    // Escキーで閉じる
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  private changeMediaQuery(event: MediaQueryListEvent) {
    this.close('none');
    if (event.matches) {
      this.activate();
    } else {
      if (this.isOpen) {
        this.disclosure.close('none').then(() => {
          this.deactivate();
        });
      } else {
        this.deactivate();
      }
    }

    this.container!.dispatchEvent(new CustomEvent('yla:changeMediaQuery', { detail: { event } }));
  }

  private onScroll() {
    if (!this.scrollTicking) {
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // スクロール方向切り替え
        if (currentScrollY > this.scrollLast && this.scrollDirection < 0) {
          // 上スクロールから下スクロールへ切り替え
          this.scrollDirection = 1;
          this.scrollBuffer = 0;
          this.scrollEventFired = false;
        } else if (currentScrollY < this.scrollLast && this.scrollDirection > 0) {
          // 下スクロールから上スクロールへ切り替え
          this.scrollDirection = -1;
          this.scrollBuffer = 0;
          this.scrollEventFired = false;
        }

        // パラメータ更新
        this.scrollBuffer += currentScrollY - this.scrollLast;
        this.scrollLast = currentScrollY;

        // スクロールのステータスをクラスに反映
        document.documentElement.classList.toggle('yla-scrolled', currentScrollY > (this.options.scroll.over || 0));
        document.documentElement.classList.toggle('yla-scrolling-down', this.scrollBuffer > 0);
        document.documentElement.classList.toggle('yla-scrolling-up', this.scrollBuffer < 0);

        // イベント発火
        if (!this.scrollEventFired) {
          if (this.scrollBuffer > (this.options.scroll.down || 0)) {
            this.container?.dispatchEvent(new CustomEvent('yla:scrolldown'));
            this.scrollEventFired = true;
          } else if (this.scrollBuffer < -(this.options.scroll.up || 0)) {
            this.container?.dispatchEvent(new CustomEvent('yla:scrollup'));
            this.scrollEventFired = true;
          }
        }

        this.scrollTicking = false;
      });

      this.scrollTicking = true;
    }
  }

  // ---------- ----------

  private activate() {
    this.isActive = true;
    this.container!.classList.add('yla-active');
    this.disclosure.setDisabled(false);
  }

  private deactivate() {
    this.isActive = false;
    this.container!.classList.remove('yla-active');
    this.disclosure.setDisabled(true);
    this.disclosure.resetAnime();
    // TODO: disclosureで、this.content.removeAttribute('aria-hidden'); しているが、メニューをsp、pcで使い回しているかどうかによって変わるかも。
  }

  private onBeforeOpen() {
    if (this.overlay) {
      this.overlay.style.display = 'block';
      this.overlay.animate(this.overlayAnime.fade, { duration: this.options.duration });
    }
  }

  private onAfterOpen() {
    this.scrollLock();
    document.addEventListener('keydown', this.handleFocusTrap);
    this.container!.dispatchEvent(new CustomEvent('yla:open'));
  }

  private onBeforeClose() {
    if (this.overlay) {
      const keyframe = [...this.overlayAnime.fade].reverse();
      const overlayAnimation = this.overlay.animate(keyframe, { duration: this.options.duration });
      overlayAnimation.finished.then(() => {
        this.overlay!.style.display = 'none';
      });
    }
  }

  private onAfterClose() {
    document.removeEventListener('keydown', this.handleFocusTrap);
    (document.activeElement as HTMLElement)?.blur();
    this.scrollUnlock();
    this.container!.dispatchEvent(new CustomEvent('yla:close'));
  }

  // ---------- ----------
  private overlayAnime: { [key: string]: Keyframe[] } = {
    fade: [{ opacity: '0' }, { opacity: '1' }],
    top: [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0%)' }],
    right: [{ transform: 'translateX(100%)' }, { transform: 'translateX(0%)' }],
    bottom: [{ transform: 'translateY(100%)' }, { transform: 'translateY(0%)' }],
    left: [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0%)' }],
  };

  // ---------- ----------
  private scrollLock() {
    // スクロール位置固定
    this.currentScrollY = window.scrollY;
    document.body.style.width = getComputedStyle(document.body).width;
    document.body.style.top = `-${this.currentScrollY}px`;
    document.body.classList.add('yla-scrolllocked');
  }

  private scrollUnlock() {
    // スクロール位置復元
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.classList.remove('yla-scrolllocked');

    window.scrollTo({ top: this.currentScrollY, behavior: 'instant' });
  }

  private focusTrap(event: KeyboardEvent) {
    // フォーカスの移動をメニュー内に制限
    if (this.focusable.length > 0) {
      const focusableFirst = this.focusable[0];
      const focusableLast = this.focusable[this.focusable.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Tab + Shift
          if (document.activeElement && !Array.from(this.focusable).includes(document.activeElement as HTMLElement)) {
            event.preventDefault();
            focusableLast?.focus();
          } else if (document.activeElement === focusableFirst) {
            event.preventDefault();
            focusableLast?.focus();
          }
        } else {
          // Tab
          if (document.activeElement && !Array.from(this.focusable).includes(document.activeElement as HTMLElement)) {
            event.preventDefault();
            focusableFirst?.focus();
          } else if (document.activeElement === focusableLast) {
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

  open(transition?: DisclosureTransitionType) {
    this.disclosure.open(transition);
  }

  close(transition?: DisclosureTransitionType) {
    this.disclosure.close(transition);
  }

  on(eventName: string, callback: (event: Event) => void) {
    if (eventName === 'yla:anchor') {
      this.container!.addEventListener(eventName, (ev: Event) => {
        const customEvent = ev as CustomEvent;
        callback(customEvent.detail.event);
      });
    } else if (eventName === 'yla:changeMediaQuery') {
      this.container!.addEventListener(eventName, (ev: Event) => {
        callback(ev as MediaQueryListEvent);
      });
    } else {
      this.container!.addEventListener(eventName, callback);
    }
  }

  destroy() {
    this.close();

    this.removeEvents();
    if (this.overlay) {
      this.overlay.getAnimations().forEach((a) => a.cancel());
      this.overlay.style.display = 'none';
      this.overlay.style.opacity = '';
    }
    this.container = null;
    this.content = null;
    this.overlay = null;
    this.trigger = undefined as unknown as NodeListOf<HTMLElement>;
    this.anchors = undefined as unknown as NodeListOf<HTMLAnchorElement>;
    this.focusable = undefined as unknown as NodeListOf<HTMLElement>;

    this.disclosure.destroy();
  }
}
