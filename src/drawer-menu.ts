import Menu from './Menu';
import Navi from './Navi';

export default Navi;
export { Menu };

/*
[ts]
import Navi, {Menu} from 'drawer-menu';
const navi = new Navi();
const menu = new Menu();
*/

/*
[umd]
<script src="drawer-menu.min.js"></script>
<script>
  const Navi = window.drawer_menu.default;
  const Menu = window.drawer_menu.Menu;
  const navi = new Navi();
  const menu = new Menu();
</script>

*/