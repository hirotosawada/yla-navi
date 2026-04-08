import './scss/common.scss';
import './scss/valikko-test.scss';

import { Valikko } from '../../src/main.ts';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector<HTMLElement>('#valikko');
  if (!container) return;

  new Valikko(container, {
    // ベース = スマホ（0px〜）
    transition: 'folding',
    click: true,
    enter: false,
    leave: false,
    isCloseSiblings: false,
    breakpoints: {
      768: {
        transition: { top: 'fade', under: 'folding' },
        enter: true,
        leave: true,
        isCloseSiblings: true,
      },
    },
  });
});
