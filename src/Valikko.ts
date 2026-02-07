import Disclosure from './Disclosure';
// ドロップダウン
import {
 DisclosureOptions, DisclosureTransitionType, ValikkoItemOptions, ValikkoOptions,
 ValikkoTransitionTopUnder
} from './type';

const defaultValikkoOptions = {
  transition: 'folding' as DisclosureTransitionType,
  item: '.valikko-item',
  trigger: '.valikko-trigger',
  child: '.valikko-child',
  isCloseChildren: true,
  isCloseSiblings: true,
  click: false,
  focus: true,
  enter: true,
  leave: true, // content ではなく container の mouseleave で閉じる
  duration: 400,
} satisfies ValikkoOptions;

/** コンストラクタで defaults とマージしたあと。defaultValikkoOptions のキーは必須になる。 */
type ValikkoResolvedOptions = typeof defaultValikkoOptions & ValikkoOptions;

export default class Valikko {
  container: HTMLElement;
  menuItems: ValikkoItem[] = [];

  options: ValikkoResolvedOptions;

  private handleOnLeave: () => void;

  constructor(container: HTMLElement | null, options: ValikkoOptions = {}) {
    if (!container) {
      throw new Error('Valikko: Missing container');
    }

    this.container = container;
    this.options = { ...defaultValikkoOptions, ...options } as ValikkoResolvedOptions;

    const items = this.container.querySelectorAll<HTMLElement>(this.options.item);

    items.forEach((item) => {
      const trigger = item.querySelector<HTMLElement>(this.options.trigger);
      const content = item.querySelector<HTMLElement>(this.options.child);

      if (content && trigger) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('valikko-child-inner');
        while (content.firstChild) {
          wrapper.appendChild(content.firstChild);
        }
        content.appendChild(wrapper);

        const transition = this.getTransitionForItem(item);
        this.menuItems.push(new ValikkoItem(item, content, trigger, { ...this.options, transition }));
      }
    });

    this.menuItems.forEach((item) => {
      item.siblings = this.getSiblings(item);
      item.children = this.getChildren(item);
    });

    this.handleOnLeave = this.onLeave.bind(this);
    this.container.addEventListener('mouseleave', this.handleOnLeave);
  }

  private onLeave(): void {
    if (!this.options.leave) return;
    this.menuItems.forEach((item) => item.close());
  }

  /**
   * 指定した .valikko-item を含む直近の .valikko-child を返す。
   * ＝ そのアイテムの「親」にあたる ValikkoItem の content 要素。
   * トップ階層の item の場合は null。
   */
  private getParentContent(containerEl: HTMLElement): HTMLElement | null {
    return containerEl.closest(this.options.child);
  }

  /** 同じ親 content を持つ兄弟（自身を除く）。 */
  private getSiblings(item: ValikkoItem): ValikkoItem[] {
    const parentContent = this.getParentContent(item.container);
    return this.menuItems.filter((m) => m !== item && this.getParentContent(m.container) === parentContent);
  }

  /** この item の content を親に持つ子アイテム。 */
  private getChildren(item: ValikkoItem): ValikkoItem[] {
    return this.menuItems.filter((m) => this.getParentContent(m.container) === item.content);
  }

  /** トップ階層かネストかで transition から選ぶ。文字列なら全階層同じ、{ top, under } なら階層別。 */
  private getTransitionForItem(itemEl: HTMLElement): DisclosureTransitionType {
    const t = this.options.transition ?? 'folding';
    const isTopLevel = !itemEl.closest(this.options.child);
    if (typeof t === 'string') return t;
    const o: ValikkoTransitionTopUnder = t;
    const top = o.top ?? o.under ?? 'folding';
    const under = o.under ?? o.top ?? 'folding';
    return isTopLevel ? top : under;
  }

  setOptions(options: ValikkoOptions) {
    this.options = { ...this.options, ...options } as ValikkoResolvedOptions;

    this.menuItems.forEach((item) => {
      const transition = this.getTransitionForItem(item.container);
      item.setOptions({ ...options, transition });
    });
  }

  close(transition?: DisclosureTransitionType) {
    this.menuItems.forEach((item) => item.close(transition));
  }

  destroy(): void {
    this.container.removeEventListener('mouseleave', this.handleOnLeave);
    this.menuItems.forEach((item) => item.destroy());
    this.menuItems = [];
  }
}

class ValikkoItem extends Disclosure {
  container: HTMLElement;
  children: ValikkoItem[] = [];
  siblings: ValikkoItem[] = [];

  isCloseChildren: boolean = true;
  isCloseSiblings: boolean = true;

  leave: boolean = true;

  private handleOnLeaveContainer: (event: MouseEvent) => void;
  protected handleOnFocusoutContainer: (event: FocusEvent) => void;

  constructor(container: HTMLElement | null, content: HTMLElement | null, triggers: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement> | null, options: ValikkoItemOptions = {}) {
    if (!container) {
      throw new Error('ValikkoItem: Missing container');
    }

    super(content, triggers, { ...options, leave: false });

    this.leave = options.leave ?? true;

    if (options.isCloseChildren !== undefined) {
      this.isCloseChildren = options.isCloseChildren;
    }

    if (options.isCloseSiblings !== undefined) {
      this.isCloseSiblings = options.isCloseSiblings;
    }

    this.handleOnLeaveContainer = this.onLeaveContainer.bind(this);
    this.handleOnFocusoutContainer = this.onFocusoutContainer.bind(this);
    this.container = container;
    this.container.addEventListener('mouseleave', this.handleOnLeaveContainer);
    this.container.addEventListener('focusout', this.handleOnFocusoutContainer);

    this.content.removeEventListener('mouseleave', this.handleOnLeave);
    this.content.removeEventListener('focusout', this.handleOnFocusout);
  }

  private onLeaveContainer() {
    if (!this.leave) {
      return;
    }

    this.close();
  }

  private onFocusoutContainer(ev: FocusEvent) {
    if (!this.leave) {
      return;
    }

    if (ev.relatedTarget && !this.content.contains(ev.relatedTarget as Node)) {
      this.close();
    }
  }

  open(transition?: DisclosureTransitionType) {
    if (this.isCloseSiblings) {
      this.closeSiblings(transition);
    }
    return super.open(transition);
  }

  close(transition?: DisclosureTransitionType) {
    if (this.isCloseChildren) {
      this.closeChildren(transition);
    }
    return super.close(transition);
  }

  closeChildren(transition?: DisclosureTransitionType): void {
    this.children.forEach((child) => {
      child.close(transition);
    });
  }

  closeSiblings(transition?: DisclosureTransitionType) {
    this.siblings.forEach((item) => {
      item.close(transition);
    });
  }

  setOptions(options: ValikkoItemOptions | DisclosureOptions) {
    super.setOptions({ ...options, leave: false });

    if ('isCloseChildren' in options && options.isCloseChildren !== undefined) {
      this.isCloseChildren = options.isCloseChildren;
    }

    if ('isCloseSiblings' in options && options.isCloseSiblings !== undefined) {
      this.isCloseSiblings = options.isCloseSiblings;
    }

    if ('leave' in options && options.leave !== undefined) {
      this.leave = options.leave ?? this.leave;
    }
  }

  destroy(): void {
    this.container.removeEventListener('mouseleave', this.handleOnLeaveContainer);
    this.container.removeEventListener('focusout', this.handleOnFocusoutContainer);
    super.destroy();
  }
}
