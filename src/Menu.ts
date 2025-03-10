// メガメニュー
// アコーディオン（folding）
// ページ
import Disclosure from './Disclosure';
// ドロップダウン
import { DisclosureOptions, MenuItemOptions, MenuOptions } from './type';

export default class Menu {
  container: HTMLElement;
  menuItems: MenuItem[] = [];

  options: Required<MenuOptions> = {
    type: 'folding',

    // MenuItemOptions
    item: '.menu__item',
    term: '.menu__term',
    child: '.menu__child',
    isCloseChildren: true,
    isCloseSiblings: true,

    // DisclosureOptions
    click: false,
    focus: true,
    enter: true,
    leave: true, // contentのleaveでなく、containerのleaveとして使う
    onOpen: () => {},
    onClose: () => {},
    transition: 'folding',
    duration: 400,
  };

  private settings: { [key: string]: { top: string; under: string } } = {
    folding: { top: 'folding', under: 'folding' },
    dropdown: { top: 'fade', under: 'fade' },
    mega: { top: 'slideRight', under: 'folding' },
  };

  private handleOnLeave: () => void;

  constructor(container: HTMLElement | null, options: MenuOptions = {}) {
    if (!container) {
      throw new Error('menu: Missing container');
    }

    this.container = container;
    this.options = { ...this.options, ...options };

    const items = this.container.querySelectorAll<HTMLElement>(this.options.item);

    items.forEach((item) => {
      const trigger = item.querySelector<HTMLElement>(this.options.term);
      const content = item.querySelector<HTMLElement>(this.options.child);

      if (content && trigger) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('menu__child__inner');
        while (content.firstChild) {
          wrapper.appendChild(content.firstChild);
        }
        content.appendChild(wrapper);

        if (item.closest(this.options.child)) {
          const transition = this.settings[this.options.type].under;
          this.menuItems.push(new MenuItem(item, content, trigger, { ...this.options, transition }));
        } else {
          const transition = this.settings[this.options.type].top;
          this.menuItems.push(new MenuItem(item, content, trigger, { ...this.options, transition }));
        }
      }
    });

    this.menuItems.forEach((item) => {
      const sibling = this.menuItems.filter((search) => search !== item && search.content.closest(this.options.item)?.closest(this.options.child) === item.content.closest(this.options.item)?.closest(this.options.child));
      const children = this.menuItems.filter((search) => search.content.closest(this.options.item)?.closest(this.options.child) === item.content);

      item.siblings = sibling;
      item.children = children;
    });

    this.handleOnLeave = () => {
      if (!this.options.leave) {
        return;
      }
      // console.log('menu: mouseleave');

      this.menuItems.forEach((item) => {
        item.close();
      });
    };

    this.container.addEventListener('mouseleave', this.handleOnLeave.bind(this));
  }

  setOptions(options: MenuOptions) {
    this.options = { ...this.options, ...options };

    // console.log('menu: setoptions', options);

    this.menuItems.forEach((item) => {
      let transition;
      if (item.content.closest(this.options.child)) {
        transition = this.settings[this.options.transition].under;
      } else {
        transition = this.settings[this.options.transition].top;
      }

      item.setOptions({ ...options, transition: transition });
    });
  }

  close() {
    this.menuItems.forEach((item) => {
      item.close();
    });
  }
}

class MenuItem extends Disclosure {
  container: HTMLElement;
  children: MenuItem[] = [];
  siblings: MenuItem[] = [];

  isCloseChildren: boolean = true;
  isCloseSiblings: boolean = true;

  leave: boolean = true;

  private handleOnLeaveContainer: (event: MouseEvent) => void;
  protected handleOnFocusoutContainer: (event: FocusEvent) => void;

  constructor(container: HTMLElement | null, content: HTMLElement | null, triggers: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement> | null, options: MenuItemOptions = {}) {
    if (!container) {
      throw new Error('MenuItem: Missing container');
    }

    super(content, triggers, { ...options, leave: false });

    // console.log(options, '/', options.leave);

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
    // console.log('menuitem: mouseleave', this.leave);
    if (!this.leave) {
      return;
    }

    this.close();
  }

  private onFocusoutContainer(ev: FocusEvent) {
    if (ev.relatedTarget && !this.content.contains(ev.relatedTarget as Node)) {
      this.close();
    }
  }

  open(transition?: string) {
    // console.log('isCloseSiblings', this.isCloseSiblings);
    if (this.isCloseSiblings) {
      this.closeSiblings(transition);
    }
    return super.open(transition);
  }

  close(transition?: string) {
    if (this.isCloseChildren) {
      this.closeChildren(transition);
    }
    return super.close(transition);
  }

  closeChildren(transition?: string): void {
    this.children.forEach((child) => {
      child.close(transition);
    });
  }

  closeSiblings(transition: string) {
    this.siblings.forEach((item) => {
      item.close(transition);
    });
  }

  setOptions(options: MenuItemOptions | DisclosureOptions) {
    // console.log(options);
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
}
