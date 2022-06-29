import { UseSlots } from '@fluentui-react-native/framework';
import { useMenuItemRadio } from './useMenuItemRadio';
import { MenuItemCheckbox, menuItemFinalRender } from '../MenuItemCheckbox/MenuItemCheckbox';
import { MenuItemCheckboxProps, MenuItemCheckboxType } from '../MenuItemCheckbox/MenuItemCheckbox.types';

export const menuItemRadioName = 'MenuItemRadio';

export const MenuItemRadio = MenuItemCheckbox.compose({
  displayName: menuItemRadioName,
  useRender: (userProps: MenuItemCheckboxProps, useSlots: UseSlots<MenuItemCheckboxType>) => {
    const menuItem = useMenuItemRadio(userProps);
    const Slots = useSlots(userProps, (layer): boolean => menuItem.state[layer]);

    return menuItemFinalRender(menuItem, Slots);
  },
});
