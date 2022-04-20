/** @jsx withSlots */
import { menuName, MenuProps, MenuTokens } from './Menu.types';
import { compressible, buildUseTokens, UseTokens } from '@fluentui-react-native/framework';

const useMenuTokens = buildUseTokens<MenuTokens>(() => ({}), menuName);

export const Menu = compressible<MenuProps, MenuTokens>((_props: MenuProps, _useTokens: UseTokens<MenuTokens>) => {
  return () => {
    return null;
  };
}, useMenuTokens);
Menu.displayName = menuName;

export default Menu;
