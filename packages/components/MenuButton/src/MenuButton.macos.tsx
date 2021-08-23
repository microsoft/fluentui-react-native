/** @jsx withSlots */
import { IUseComposeStyling, compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const NativeMenuButton = ensureNativeComponent('FRNMenuButton');

import {
  MenuButtonName,
  MenuButtonProps,
  MenuButtonSlotProps,
  MenuButtonType,
  MenuButtonRenderData,
  MenuButtonState,
} from './MenuButton.types';

export const MenuButton = compose<MenuButtonType>({
  displayName: MenuButtonName,
  usePrepareProps: (userProps: MenuButtonProps, useStyling: IUseComposeStyling<MenuButtonType>) => {
    const { menuItems, content, startIcon, disabled, onItemClick } = userProps;

    const state: MenuButtonState = {
      context: {},
    };

    // reroute the native component's OnItemClick event to MenuButtons's onItemClick
    const OnItemClickRerouted = (event: any) => {
      if (onItemClick != null) {
        onItemClick(event.nativeEvent.key);
      }
    };

    // reroute the native component's onSubmenuItemClick event to each MenuButtonItem's onItemClick
    const OnSubmenuItemClickRerouted = (event: any) => {
      // Grab the index of the menu item that hosts the submenu to look up the correct callback
      const menuItemIndex = event.nativeEvent.index;

      const onSubmenuItemClick = menuItems[menuItemIndex].submenuProps?.onItemClick;
      if (onSubmenuItemClick != null) {
        onSubmenuItemClick(event.nativeEvent.key);
      }
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const slotProps = mergeSettings<MenuButtonSlotProps>(styleProps, {
      root: {
        content: content,
        disabled: disabled,
        image: startIcon,
        menuItems: menuItems,
        onItemClick: OnItemClickRerouted,
        onSubmenuItemClick: OnSubmenuItemClickRerouted,
        style: {
          width: 160,
          height: 32,
        },
      },
    });

    return { slotProps, state };
  },
  slots: {
    root: NativeMenuButton,
  },
  styles: {
    contextualMenu: [backgroundColorTokens, borderTokens],
    button: [backgroundColorTokens, borderTokens],
  },
  render: (Slots: ISlots<MenuButtonSlotProps>, renderData: MenuButtonRenderData) => {
    if (!(renderData.state && renderData.slotProps)) {
      return null;
    }
    return <Slots.root />;
  },
});

export default MenuButton;
