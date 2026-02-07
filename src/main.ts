/**
 * @packageDocumentation
 * yla-navi: ヘッダーナビ（Yla）とドロップダウンメニュー（Valikko）のライブラリ
 *
 * - **Yla** (default): ドロワー／オーバーレイ型ナビ。breakpoint 未満で有効。
 * - **Valikko** (named): 多段ドロップダウン。breakpoints でレスポンシブにオプションを切り替え可能。
 */
import Valikko from './Valikko';
import Yla from './Yla';

export default Yla;
export { Valikko };

/*
[ts]
import Yla, { Valikko } from '@local/navi';
const yla = new Yla();
const valikko = new Valikko();
*/

/*
[umd]
<script src="yla.min.js"></script>
<script>
  const Yla = window.drawer_menu.default;
  const Valikko = window.drawer_menu.Valikko;
  const yla = new Yla();
  const valikko = new Valikko();
</script>
*/
