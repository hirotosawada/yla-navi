import Drawer from './Drawer';
import Menu from './Menu';

export default Drawer;
export { Menu };

/*
[ts]
import Drawer, {Menu} from 'drawer-menu';
const drawer = new Drawer();
const menu = new Menu();
*/

/*
[umd]
<script src="drawer-menu.min.js"></script>
<script>
  const Drawer = window.drawer_menu.default;
  const Menu = window.drawer_menu.Menu;
  const drawer = new Drawer();
  const menu = new Menu();
</script>

*/