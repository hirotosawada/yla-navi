import './scss/style.scss';

import Disclosure from '../../src/Disclosure.ts';
import Yla, { Valikko } from '../../src/main.ts';

// import Tab from '../../src/Tab.ts';

document.addEventListener('DOMContentLoaded', function () {
  const breakpoint = 768;

  const yla = new Yla(document.querySelector('.navi'), { transition: 'slideTop', breakpoint });

  document.querySelectorAll('.valikko-item').forEach((item) => {
    item.addEventListener('click', () => {});
  });
  // ========== ========== ========== ========== ==========

  const valikko = new Valikko(document.querySelector('.valikko'));
  // valikko.setOptions({ transition: 'folding', click: true, focus: true, enter: false, leave: false, isCloseSiblings: true });

  const changeMediaQuery = (event: MediaQueryListEvent) => {
    valikko.close('none');

    if (event.matches) {
      console.log(`Viewport <= ${breakpoint}px`);
      valikko.setOptions({ transition: 'folding', click: true, focus: true, enter: false, leave: false, isCloseSiblings: false });
    } else {
      console.log(`Viewport > ${breakpoint}px`);
      valikko.setOptions({ transition: { top: 'fade', under: 'folding' }, click: true, focus: true, enter: true, leave: true, isCloseSiblings: true });
    }
  };
  const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
  mediaQuery.addEventListener('change', changeMediaQuery);
  changeMediaQuery({
    matches: mediaQuery.matches,
    media: mediaQuery.media,
  } as MediaQueryListEvent);

  // ========== ========== ========== ========== ==========

  // document.querySelector('.btn-close')?.addEventListener('click', () => {
  //   valikko.close('none');
  // });

  new Disclosure(document.querySelector('.accordion__body'), document.querySelector('.accordion__trigger'));

  // new Tab(document.querySelector('.tab'));
});
