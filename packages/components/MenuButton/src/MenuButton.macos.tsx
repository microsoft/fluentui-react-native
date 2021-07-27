/** @jsx withSlots */
import { useRef } from 'react';
import { IUseComposeStyling, compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const NativeMenuButton = ensureNativeComponent('MSFMenuButton');

const slotsMacOS = {
  // nativeComponent: NativeMenuButton,
  root: NativeMenuButton,
};

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
    const { menuItems, content, icon, disabled, onItemClick, contextualMenu } = userProps;

    const stdBtnRef = useRef(null);

    const state: MenuButtonState = {
      context: {},
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const slotProps = mergeSettings<MenuButtonSlotProps>(styleProps, {
      root: {
        style: {
          width: 160,
          height: 32,
        },
      },
      button: {
        content,
        disabled,
        icon,
        componentRef: stdBtnRef,
      },
      contextualMenu: {
        onItemClick,
        target: stdBtnRef,
        ...contextualMenu,
      },
      contextualMenuItems: {
        menuItems: menuItems,
      },
    });

    return { slotProps, state };
  },
  slots: slotsMacOS,
  styles: {
    contextualMenu: [backgroundColorTokens, borderTokens],
    button: [backgroundColorTokens, borderTokens],
  },
  render: (Slots: ISlots<MenuButtonSlotProps>, renderData: MenuButtonRenderData) => {
    if (!(renderData.state && renderData.slotProps)) {
      return null;
    }
    const menuItems = renderData.slotProps!.contextualMenuItems?.menuItems || [];

    const onPress = (event: any) => {
      if (renderData.slotProps!.contextualMenu.onItemClick != null) {
        renderData.slotProps!.contextualMenu.onItemClick(event.nativeEvent.key);
      }
    };
    return (
      <Slots.root
        onPress={onPress}
        menuItems={menuItems}
        content={renderData.slotProps!.button.content}
        disabled={renderData.slotProps!.button.disabled}
        imageSource={{
          uri:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAAEXRFWHRTb2Z0d2FyZQBwbmdjcnVzaEB1SfMAAABQSURBVGje7dSxCQBACARB+2/ab8BEeQNhFi6WSYzYLYudDQYGBgYGBgYGBgYGBgYGBgZmcvDqYGBgmhivGQYGBgYGBgYGBgYGBgYGBgbmQw+P/eMrC5UTVAAAAABJRU5ErkJggg==',
        }}
      />
    );
  },
});

export default MenuButton;
