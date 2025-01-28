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

  isCloseChildren?: boolean;
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
}
