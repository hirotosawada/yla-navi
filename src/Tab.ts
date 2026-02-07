import Disclosure from './Disclosure';

interface TabOptions {
  // オプションの型定義
  selectorTrigger: string;
  selectorContent: string;

  transition: string;
  duration: number;
  initial: number;
}

export default class Tab {
  private container: HTMLElement | null = null;
  private trigger: NodeListOf<HTMLElement> | null = null;
  private content: NodeListOf<HTMLElement> | null = null;
  private currentIndex: number = 0;

  //オプション
  private optionsDefaut: Required<TabOptions> = {
    selectorTrigger: '.tab__navi__item',
    selectorContent: '.tab__body__item',

    transition: '',
    duration: 600,
    initial: 1,
  };

  private options: Required<TabOptions>;

  private items: Disclosure[] = [];

  constructor(container: HTMLElement | null, options?: TabOptions) {
    if (!container) {
      throw new Error('tab: Missing container');
    }

    this.container = container;
    this.options = Object.assign({}, this.optionsDefaut, options || {});

    this.trigger = this.container?.querySelectorAll(this.options.selectorTrigger);
    this.content = this.container?.querySelectorAll(this.options.selectorContent);

    if (!this.trigger || !this.content) {
      throw new Error('tab: Missing trigger or content');
    }

    if (this.trigger.length !== this.content?.length) {
      throw new Error('tab: The number of triggers and contents do not match');
    }

    this.trigger.forEach((el, index) => {
      el.setAttribute('role', 'tab');

      el.addEventListener('click', (e) => {
        console.log(this.currentIndex, index);

        if (this.currentIndex !== index) {
          this.items[index].open();
          this.trigger.forEach((el) => {
            el.setAttribute('aria-selected', 'false');
          });
          el.setAttribute('aria-selected', 'true');

          this.items[this.currentIndex].close();
          this.currentIndex = index;
        }
      });
    });

    this.content.forEach((el, index) => {
      el.setAttribute('role', 'tabpanel');

      // TODO: タブが開いている時は、ボタンが押されても閉じないようにする
      this.items.push(
        new Disclosure(el, [], {
          isTab: true,
        }),
      );
    });

    this.currentIndex = this.options.initial - 1;

    this.items[this.currentIndex].open('none');
  }

  private open(index: number) {
    // this.items.forEach((item, i) => {
    //   if (item.isOpen && i !== index) {
    //     item.close();
    //   } else if (!item.isOpen && i === index) {
    //     item.open();
    //   }
    // });
    // this.currentIndex = index;
  }
}
