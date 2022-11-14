/** @jsx withSlots */
import { Image, ImageResolvedAssetSource } from 'react-native';
import { IUseComposeStyling, compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { IconProps, createIconProps } from '@fluentui-react-native/icon';
import {
  MenuButtonName,
  MenuButtonProps,
  MenuButtonSlotProps,
  MenuButtonType,
  MenuButtonRenderData,
  MenuButtonState,
  MenuButtonItemProps,
} from './MenuButton.types';

const NativeMenuButton = ensureNativeComponent('FRNMenuButton');

// Represents the props available on a native NSMenuItem
// https://developer.apple.com/documentation/appkit/nsmenuitem
type NativeMenuItem = {
  title: string;
  image: ImageResolvedAssetSource;
  enabled: boolean;
  tooltip: string;
  identifier: string;
  hasSubmenu: boolean;
  submenu: NativeMenuItem[];
};

export const MenuButton = compose<MenuButtonType>({
  displayName: MenuButtonName,
  usePrepareProps: (userProps: MenuButtonProps, useStyling: IUseComposeStyling<MenuButtonType>) => {
    const { content, menuItems, tooltip, startIcon, disabled, onItemClick, style } = userProps;

    function extractResolvedImageSourceFromIcon(icon?: number | string | IconProps): ImageResolvedAssetSource {
      if (!icon) {
        return null;
      }
      // GH #931, only PNG images are supported on the macOS MenuButton
      const iconProps = createIconProps(icon);
      const imageSource = Image.resolveAssetSource(iconProps?.rasterImageSource?.src);
      return imageSource;
    }

    const imageSource = extractResolvedImageSourceFromIcon(startIcon);

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

    // Transform the menuItem props to match the native props of NSMenuItem
    function transformMenuItems(menuItems: MenuButtonItemProps[]): NativeMenuItem[] {
      const nativeMenuItems: NativeMenuItem[] = [];
      menuItems.forEach((item) => {
        const imageSource = extractResolvedImageSourceFromIcon(item.icon);

        // Recursively parse submenus
        const submenu = item.hasSubmenu ? transformMenuItems(item.submenuItems) : null;

        const transformedItem: NativeMenuItem = {
          title: item.text,
          ...(imageSource && { image: imageSource }), // Only pass in the prop if defined
          enabled: !item.disabled,
          tooltip: item.title,
          identifier: item.itemKey,
          hasSubmenu: item.hasSubmenu,
          submenu: submenu,
        };
        nativeMenuItems.push(transformedItem);
      });
      return nativeMenuItems;
    }

    // Default style if none from user props
    const rootStyleProp = style ?? {
      width: 160,
      height: 32,
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const slotProps = mergeSettings<MenuButtonSlotProps>(styleProps, {
      root: {
        content: content,
        enabled: !disabled,
        ...(imageSource && { image: imageSource }), // Only pass in the prop if defined
        tooltip: tooltip,
        menu: transformMenuItems(menuItems),
        onItemClick: OnItemClickRerouted,
        onSubmenuItemClick: OnSubmenuItemClickRerouted,
        style: rootStyleProp,
      },
    });

    const state: MenuButtonState = {
      context: {},
    };

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
