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

if (typeof window !== 'undefined') {
  (window as unknown as { Yla: typeof Yla; Valikko: typeof Valikko }).Yla = Yla;
  (window as unknown as { Yla: typeof Yla; Valikko: typeof Valikko }).Valikko = Valikko;
}

/*
[ts]
import Yla, { Valikko } from '@local/navi';
const yla = new Yla();
const valikko = new Valikko();
*/

/*
[umd]
<script src="yla-bundle.min.js"></script>
<script>
  const yla = new Yla(container, options);
  const valikko = new Valikko(container, options);
</script>
*/
