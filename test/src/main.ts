import { Drawer, Menu } from '../../src/drawer-menu.ts';

document.addEventListener('DOMContentLoaded', function () {
  const breakpoint = 768;

  const drawer = new Drawer(document.querySelector('.drawer'), { transition: 'slideRight', duration: 200, breakpoint });

  // ========== ========== ========== ========== ==========

  const menu = new Menu(document.querySelector('.menu'));

  const changeMediaQuery = (event: MediaQueryListEvent) => {
    menu.close('none');

    if (event.matches) {
      console.log(`Viewport <= ${breakpoint}px`);
      menu.setOptions({ transition: 'folding', click: true, focus: true, enter: false, leave: false, isCloseSiblings: false });
    } else {
      console.log(`Viewport > ${breakpoint}px`);
      menu.setOptions({ transition: 'dropdown', click: true, focus: true, enter: false, leave: false, isCloseSiblings: true });
    }
  };
  const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
  mediaQuery.addEventListener('change', changeMediaQuery);
  changeMediaQuery({
    matches: mediaQuery.matches,
    media: mediaQuery.media,
  } as MediaQueryListEvent);

  // ========== ========== ========== ========== ==========

  document.querySelector('.btn-close')?.addEventListener('click', () => {
    menu.close('none');
  });
});
