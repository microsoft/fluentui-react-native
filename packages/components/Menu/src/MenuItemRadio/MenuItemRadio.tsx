import type { UseSlots } from '@fluentui-react-native/framework';

import { useMenuItemRadio } from './useMenuItemRadio';
import { MenuItemCheckbox, menuItemFinalRender } from '../MenuItemCheckbox/MenuItemCheckbox';
import { menuItemRadioName } from '../MenuItemRadio/MenuItemRadio.types';
import type { MenuItemRadioProps, MenuItemRadioType } from '../MenuItemRadio/MenuItemRadio.types';

export const MenuItemRadio = MenuItemCheckbox.compose({
  displayName: menuItemRadioName,
  useRender: (userProps: MenuItemRadioProps, useSlots: UseSlots<MenuItemRadioType>) => {
    const menuItem = useMenuItemRadio(userProps);
    const Slots = useSlots(userProps, (layer): boolean => menuItem.state[layer]);

    return menuItemFinalRender(menuItem, Slots);
  },
});
