/** @jsx withSlots */
import { menuName, MenuType } from './Menu.types';
import { compose } from '@fluentui-react-native/framework';

export const Menu = compose<MenuType>({
  displayName: menuName,
  slots: {},
  useRender: () => {
    return () => {
      return null;
    };
  },
});

export default Menu;
