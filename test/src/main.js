"use strict";

var _drawerMenu = require("../../src/drawer-menu.ts");
document.addEventListener('DOMContentLoaded', function () {
  var _document$querySelect;
  var breakpoint = 768;
  var drawer = new _drawerMenu.Drawer(document.querySelector('.drawer'), {
    transition: 'fade',
    duration: 200,
    breakpoint: breakpoint
  });

  // ========== ========== ========== ========== ==========

  var menu = new _drawerMenu.Menu(document.querySelector('.menu'));
  var changeMediaQuery = function changeMediaQuery(event) {
    menu.close('none');
    if (event.matches) {
      console.log("Viewport <= ".concat(breakpoint, "px"));
      menu.setOptions({
        transition: 'folding',
        click: true,
        focus: true,
        enter: false,
        leave: false,
        isCloseSiblings: false
      });
    } else {
      console.log("Viewport > ".concat(breakpoint, "px"));
      menu.setOptions({
        transition: 'dropdown',
        click: true,
        focus: true,
        enter: false,
        leave: false,
        isCloseSiblings: true
      });
    }
  };
  var mediaQuery = window.matchMedia("(max-width: ".concat(breakpoint, "px)"));
  mediaQuery.addEventListener('change', changeMediaQuery);
  changeMediaQuery({
    matches: mediaQuery.matches,
    media: mediaQuery.media
  });

  // ========== ========== ========== ========== ==========

  (_document$querySelect = document.querySelector('.btn-close')) === null || _document$querySelect === void 0 || _document$querySelect.addEventListener('click', function () {
    menu.close('none');
  });
});
//# sourceMappingURL=main.js.map