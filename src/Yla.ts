import Disclosure from './Disclosure';
import { DisclosureTransitionType, YlaOptions } from './type';

/**
 * ドロワー／オーバーレイ型のヘッダーナビゲーション（正式名: Ylä）。
 * ブレークポイント未満でドロワーを有効にし、トリガー・オーバーレイ・コンテンツの開閉を行う。
 */
export default class Yla {
  // DOM
  private container: HTMLElement | null = null;
  private navi: HTMLElement | null = null;
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
  private handleOnLeaveContainer: (event: MouseEvent) => void = () => {};

  // ステータス
  private isInit: boolean = false;
  private isActive: boolean = false;
  private mediaQuery: MediaQueryList | null = null;

  // スクロールロック時の保存値
  private isScrollLockActive: boolean = false;
  private savedWindowScrollY: number = 0;
  private savedElementScrollTop: number = 0;
  private savedWidth: string = '';

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
    selectorNavi: '.yla-navi',
    breakpoint: null,

    transition: 'fade',
    duration: 600,
    scroll: { over: 200, up: 0, down: 0 },
    scrollLockTarget: document.body,
  };
  private options: Required<YlaOptions>;

  /**
   * @param container - ドロワーのルート要素（.navi など）
   * @param options - セレクタ・breakpoint・transition などのオプション
   */
  constructor(container: HTMLElement | null, options?: YlaOptions) {
    this.options = Object.assign({}, this.optionsDefault, options);
    this.options.scroll = {
      ...this.optionsDefault.scroll,
      ...(options?.scroll ?? {}),
    };

    this.container = container;
    this.container?.classList.add('yla-init');
    this.navi = this.container?.querySelector<HTMLElement>(this.options.selectorNavi) ?? this.container ?? null;
    this.overlay = document.querySelector<HTMLElement>(this.options.selectorOverlay);
    if (this.overlay) this.overlay.style.display = 'none';

    this.trigger = document.querySelectorAll<HTMLElement>(this.options.selectorTrigger);

    this.isInit = !!this.container && !!this.navi && this.trigger.length > 0;

    if (!this.isInit) {
      throw new Error('Yla: Not found element');
    }

    this.disclosure = new Disclosure(this.navi, this.trigger, {
      onBeforeOpen: this.onBeforeOpen.bind(this),
      onAfterOpen: this.onAfterOpen.bind(this),
      onBeforeClose: this.onBeforeClose.bind(this),
      onAfterClose: this.onAfterClose.bind(this),
      transition: this.options.transition,
      duration: this.options.duration,
    });

    this.anchors = this.navi!.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    this.focusable = this.navi!.querySelectorAll<HTMLElement>('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');

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
    this.handleOnLeaveContainer = this.onLeaveContainer.bind(this);
  }

  private addEvents() {
    this.container?.addEventListener('mouseleave', this.handleOnLeaveContainer);
    this.overlay?.addEventListener('click', this.handleClickOverlay);
    this.anchors.forEach((anchor) => {
      anchor.addEventListener('click', this.handleClickAnchor);
    });

    document.addEventListener('keydown', this.handleKeydownEsc);

    if (this.options.breakpoint) {
      this.mediaQuery = window.matchMedia(`(min-width: ${this.options.breakpoint}px)`);
      this.mediaQuery.addEventListener('change', this.handleChangeMediaQuery);
      this.changeMediaQuery({ matches: this.mediaQuery.matches, media: this.mediaQuery.media } as MediaQueryListEvent);
    } else {
      this.activate();
    }

    window.addEventListener('scroll', this.handleOnScroll);
  }

  private removeEvents() {
    this.container?.removeEventListener('mouseleave', this.handleOnLeaveContainer);
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

  private onLeaveContainer() {
    this.container?.dispatchEvent(new CustomEvent('yla:leave'));
  }

  private keydownEsc(event: KeyboardEvent) {
    // Escキーで閉じる
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  private changeMediaQuery(event: MediaQueryListEvent) {
    this.close('none');
    // min-width: この幅以上ならドロワー無効、未満ならドロワー有効（Valikko の breakpoints と揃えたスマホファースト）
    if (event.matches) {
      if (this.isOpen) {
        this.disclosure.close('none').then(() => {
          this.deactivate();
        });
      } else {
        this.deactivate();
      }
    } else {
      this.activate();
    }

    this.container!.dispatchEvent(new CustomEvent('yla:changeMediaQuery', { detail: { event } }));
  }

  private getScrollThreshold(which: 'over' | 'up' | 'down'): number {
    const fallbacks = { over: 200, up: 0, down: 0 } as const;
    const raw = this.options.scroll[which] ?? fallbacks[which];
    return typeof raw === 'function' ? raw() : raw;
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
        document.documentElement.classList.toggle('yla-scrolled', currentScrollY > this.getScrollThreshold('over'));
        document.documentElement.classList.toggle('yla-scrolling-down', this.scrollBuffer > 0);
        document.documentElement.classList.toggle('yla-scrolling-up', this.scrollBuffer < 0);

        // イベント発火
        if (!this.scrollEventFired) {
          if (this.scrollBuffer > this.getScrollThreshold('down')) {
            this.container?.dispatchEvent(new CustomEvent('yla:scrolldown'));
            this.scrollEventFired = true;
          } else if (this.scrollBuffer < -this.getScrollThreshold('up')) {
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
    // TODO: disclosure で開閉対象（navi）の aria-hidden を制御している。メニューを sp/pc で使い回す場合は要検討。
  }

  private onBeforeOpen() {
    if (this.overlay) {
      this.overlay.style.display = 'block';
      this.overlay.animate(this.overlayAnime.fade, { duration: this.options.duration });
    }
    this.scrollLock();
    this.container!.dispatchEvent(new CustomEvent('yla:beforeOpen'));
  }

  private onAfterOpen() {
    document.addEventListener('keydown', this.handleFocusTrap);
    this.container!.dispatchEvent(new CustomEvent('yla:afterOpen'));
    this.container!.dispatchEvent(new CustomEvent('yla:open')); // 互換性のために残す。いずれ削除する
  }

  private onBeforeClose() {
    if (this.overlay) {
      const keyframe = [...this.overlayAnime.fade].reverse();
      const overlayAnimation = this.overlay.animate(keyframe, { duration: this.options.duration });
      overlayAnimation.finished.then(() => {
        this.overlay!.style.display = 'none';
      });
    }
    this.scrollUnlock();
    this.container!.dispatchEvent(new CustomEvent('yla:beforeClose'));
  }

  private onAfterClose() {
    document.removeEventListener('keydown', this.handleFocusTrap);
    (document.activeElement as HTMLElement)?.blur();
    this.container!.dispatchEvent(new CustomEvent('yla:afterClose'));
    this.container!.dispatchEvent(new CustomEvent('yla:close')); // 互換性のために残す。いずれ削除する
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
    const target = this.options.scrollLockTarget;
    if (target == null) return;

    this.savedWindowScrollY = window.scrollY;
    this.savedElementScrollTop = target.scrollTop;

    // 常時表示スクロールバーが消えたときの幅ジャンプを抑える（ロック前に幅を計測）
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    this.savedWidth = target.style.width;

    const rect = target.getBoundingClientRect();
    const computed = getComputedStyle(target);
    const isDocRoot = target === document.body || target === document.documentElement;

    target.style.position = 'fixed';
    target.style.top = `${rect.top}px`;
    // スクロールバー非表示でレイアウト幅が広がる場合は、ロック直前の描画幅（px）に固定する
    target.style.width = scrollbarWidth > 0 ? `${rect.width}px` : computed.width;

    if (!isDocRoot) {
      target.style.left = `${rect.left}px`;
      target.style.height = `${rect.height}px`;
    } else {
      target.style.left = '';
      target.style.height = '';
    }
    target.style.overflow = 'hidden';
    target.classList.add('yla-scrolllocked');

    this.isScrollLockActive = true;
  }

  private scrollUnlock() {
    const target = this.options.scrollLockTarget;
    if (target == null || !this.isScrollLockActive) return;
    this.isScrollLockActive = false;

    target.style.position = '';
    target.style.top = '';
    target.style.left = '';
    target.style.width = this.savedWidth;
    target.style.height = '';
    target.style.overflow = '';
    target.classList.remove('yla-scrolllocked');

    window.scrollTo({ top: this.savedWindowScrollY, behavior: 'instant' });
    target.scrollTop = this.savedElementScrollTop;
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

  /** ドロワーが開いているか */
  get isOpen() {
    return this.disclosure.isOpen;
  }

  /**
   * ドロワーを開く
   * @param transition - この回だけ使うトランジション（省略時はオプションの transition）
   */
  open(transition?: DisclosureTransitionType) {
    this.disclosure.open(transition);
  }

  /**
   * ドロワーを閉じる
   * @param transition - この回だけ使うトランジション（省略時はオプションの transition）
   */
  close(transition?: DisclosureTransitionType) {
    this.disclosure.close(transition);
  }

  /**
   * カスタムイベントのリスナーを登録する
   *
   * @param eventName - 次のいずれか（`container` にバブルする）
   * - 開閉フェーズ: `yla:beforeOpen`（オーバーレイ表示・`scrollLock` 直後。対象は `scrollLockTarget`）, `yla:afterOpen`（フォーカストラップ登録直後）, `yla:beforeClose`（`scrollUnlock` 直後）, `yla:afterClose`（フォーカストラップ解除・`blur` 直後）
   * - 互換: `yla:open`（`yla:afterOpen` と同タイミング）, `yla:close`（`yla:afterClose` と同タイミング）
   * - その他: `yla:leave`, `yla:anchor`, `yla:changeMediaQuery`, `yla:scrolldown`, `yla:scrollup`
   * @param callback - 発火時に呼ばれる関数（`yla:anchor` のみ `click` の `MouseEvent` が渡る）
   */
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

  /** イベントを外し、インスタンスを破棄する */
  destroy() {
    this.close();

    this.removeEvents();
    if (this.overlay) {
      this.overlay.getAnimations().forEach((a) => a.cancel());
      this.overlay.style.display = 'none';
      this.overlay.style.opacity = '';
    }
    this.container = null;
    this.navi = null;
    this.overlay = null;
    this.trigger = undefined as unknown as NodeListOf<HTMLElement>;
    this.anchors = undefined as unknown as NodeListOf<HTMLAnchorElement>;
    this.focusable = undefined as unknown as NodeListOf<HTMLElement>;

    this.disclosure.destroy();
  }
}
