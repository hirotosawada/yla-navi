export interface DisclosureOptions {
  click?: boolean;
  focus?: boolean;
  enter?: boolean;
  leave?: boolean;
  onOpen?: () => void;
  onClose?: () => Promise<void> | void;

  transition?: string;
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

export interface MenuItemOptions extends DisclosureOptions {
  item?: string;
  term?: string;
  child?: string;

  isCloseChildren?: boolean; // 子を閉じないとかありえる？
  isCloseSiblings?: boolean;
}

export interface MenuOptions extends MenuItemOptions {
  type?: string;
}

export interface DrawerOptions {
  selectorTrigger?: string;
  selectorOverlay?: string;
  selectorContent?: string;
  breakpoint?: number | null;
  transition?: string;
  duration?: number;
  scroll?: {
    over?: number;
    up?: number;
    down?: number;
  };
}

// ========== ========== ========== ========== ==========
export interface DrawerOptions2 {
  content?: string;
  overlay?: string;
  trigger?: string;

  transition?: string;
  duration?: number;

  breakpoint?: number | null;
}

export interface DisclosureOptions2 {
  onOpen?: () => void;
  onClose?: () => Promise<void> | void;

  transition?: string;
  duration?: number;

  isOpen?: {
    click?: boolean;
    focus?: boolean;
    enter?: boolean;
  };

  isClose?: {
    click?: boolean;
    leave?: boolean;
  };
}

export interface TriggerOptions2 {
  onClick?: (event: MouseEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;

  isOpen?: {
    click?: boolean;
    focus?: boolean;
    enter?: boolean;
  };
}

export interface MenuItemOptions2 extends DisclosureOptions2 {
  item?: string;
  term?: string;
  child?: string;

  isCloseChildren?: boolean; // 子を閉じないとかありえる？
  isCloseSiblings?: boolean;
}
