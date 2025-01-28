import { Drawer, Menu } from '../../src/drawer-menu.ts';

document.addEventListener('DOMContentLoaded', function () {
  const breakpoint = 768;

  const drawer = new Drawer(document.querySelector('.drawer'), { transition: 'slideRight', duration: 200, breakpoint });
  const menu = new Menu(document.querySelector('.menu'), { transition: 'mega' });

  const changeMediaQuery = (event: MediaQueryListEvent) => {
    if (event.matches) {
      console.log(`Viewport <= ${breakpoint}px`);
      menu.setOptions({ transition: 'folding' });
    } else {
      console.log(`Viewport > ${breakpoint}px`);
      menu.setOptions({ transition: 'mega' });
    }
  };
});
