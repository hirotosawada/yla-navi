import { TriggerOptions } from './type';

export default class Trigger {
  id: string;
  trigger: HTMLElement;
  options: TriggerOptions = {};
  private isMouseDown: boolean = false;

  private isDisabled: boolean = false;

  handleOnClick: (event: MouseEvent) => void;
  handleOnFocus: (event: FocusEvent) => void;
  handleOnMouseEnter: (event: MouseEvent) => void;

  handleOnMouseDown = () => {
    // console.log('trigger: mousedown');
    this.isMouseDown = true;
  };

  handleOnMouseUp = () => {
    // console.log('trigger: mouseup');
    this.isMouseDown = false;
  };

  constructor(id: string, trigger: HTMLElement, options: TriggerOptions) {
    // console.log('trigger: class initialized', options);

    this.id = id;
    this.trigger = trigger;
    this.options = Object.assign({}, this.options, options);

    this.trigger.setAttribute('aria-controls', this.id);
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.setAttribute('role', 'button');
    this.trigger.setAttribute('tabindex', '0');

    this.trigger.addEventListener('mousedown', this.handleOnMouseDown);
    this.trigger.addEventListener('mouseup', this.handleOnMouseUp);

    this.handleOnClick = this.onClick.bind(this);
    this.handleOnFocus = this.onFocus.bind(this);
    this.handleOnMouseEnter = this.onMouseEnter.bind(this);

    if (this.options.onClick) {
      this.trigger.addEventListener('click', this.handleOnClick);
    }

    if (this.options.onFocus) {
      this.trigger.addEventListener('focus', this.handleOnFocus);
    }

    if (this.options.onMouseEnter) {
      this.trigger.addEventListener('mouseenter', this.handleOnMouseEnter);
    }
  }

  // ========== ========== ========== ========== ==========
  private onClick(event: MouseEvent) {
    if (this.options.click) {
      // triggerが aタグだった時にクリック時の遷移を防ぐ
      event.preventDefault();
    }

    if (this.isDisabled || !this.options.click) {
      return;
    }
    // console.log('trigger: click');

    this.options.onClick?.(event);
  }

  private onFocus(event: FocusEvent) {
    if (this.isMouseDown || this.isDisabled || !this.options.focus) {
      // マウスからのフォーカスは無視
      return;
    }
    // console.log('trigger: focus');

    this.options.onFocus?.(event);
  }

  private onMouseEnter(event: MouseEvent) {
    if (this.isDisabled || !this.options.enter) {
      return;
    }
    // console.log('trigger: mouseenter', this.options.enter);

    this.options.onMouseEnter?.(event);
  }

  // ========== ========== ========== ========== ==========

  setExpanded(expanded: boolean) {
    this.trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  setDisabled(isDisabled: boolean) {
    this.isDisabled = isDisabled;

    if (isDisabled) {
      this.trigger.setAttribute('disabled', 'true');
    } else {
      this.trigger.removeAttribute('disabled');
    }
  }

  setOptions(options: TriggerOptions) {
    this.options = { ...this.options, ...options };
  }

  destroy() {
    if (this.options.onClick) {
      this.trigger.removeEventListener('click', this.handleOnClick);
    }

    if (this.options.onFocus) {
      this.trigger.removeEventListener('focus', this.handleOnFocus);
    }

    if (this.options.onMouseEnter) {
      this.trigger.removeEventListener('mouseenter', this.handleOnMouseEnter);
    }

    this.trigger.removeEventListener('mousedown', this.handleOnMouseDown);
    this.trigger.removeEventListener('mouseup', this.handleOnMouseUp);
  }
}
