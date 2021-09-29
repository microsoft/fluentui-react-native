/** @jsx withSlots */
import * as React from 'react';
import { findNodeHandle, ImageResolvedAssetSource, Image, View } from 'react-native';
import {
  contextualMenuName,
  ContextualMenuProps,
  ContextualMenuSlotProps,
  ContextualMenuType,
  ContextualMenuRenderData,
  ContextualMenuContext,
  ContextualMenuState,
} from './ContextualMenu.types';
import { settings } from './ContextualMenu.settings';
import { IUseComposeStyling, compose } from '@uifabricshared/foundation-compose';
import { createIconProps, useSelectedKey } from '@fluentui-react-native/interactive-hooks';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { IconProps } from '@fluentui-react-native/icon';

const NativeContextualMenu = ensureNativeComponent('FRNContextualMenu');

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

function extractResolvedImageSourceFromIcon(icon?: number | string | IconProps): ImageResolvedAssetSource {
  if (!icon) {
    return null;
  }
  // GH #931, only PNG images are supported on the macOS MenuButton
  const iconProps = createIconProps(icon);
  const imageSource = Image.resolveAssetSource(iconProps?.rasterImageSource?.src);
  return imageSource;
}

export const CMContext = React.createContext<ContextualMenuContext>({
  selectedKey: null,
  onItemClick: (/* key: string */) => {
    return;
  },
  onDismissMenu: () => {
    return;
  },
});

export const ContextualMenu = compose<ContextualMenuType>({
  displayName: contextualMenuName,
  usePrepareProps: (userProps: ContextualMenuProps, useStyling: IUseComposeStyling<ContextualMenuType>) => {
    const { setShowMenu, target, onItemClick, onDismiss, ...rest } = userProps;

    // This hook updates the Selected Button and calls the customer's onClick function. This gets called after a button is pressed.
    const data = useSelectedKey(null, userProps.onItemClick);

    const dismissCallback = React.useCallback(() => {
      onDismiss();
      setShowMenu(false);
    }, [setShowMenu, onDismiss]);

    const state: ContextualMenuState = {
      context: {
        selectedKey: data.selectedKey,
        onItemClick: data.onKeySelect,
        onDismissMenu: dismissCallback,
      },
    };

    // reroute the native component's OnItemClick event to Menu's onItemClick
    const OnItemClickRerouted = (event: any) => {
      if (onItemClick != null) {
        onItemClick(event.nativeEvent.key);
      }
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const slotProps = mergeSettings<ContextualMenuSlotProps>(styleProps, {
      root: {
        targetViewTag: findNodeHandle((target as React.RefObject<View>).current),
        onItemClick: OnItemClickRerouted,
        onDismiss: dismissCallback,
        style: {
          display: 'none', // The view should take up no space, as it's just a proxy to fire the NSMenu
        },
        ...rest,
      },
    });

    return { slotProps, state };
  },
  settings: settings,
  slots: {
    root: NativeContextualMenu,
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
    container: [],
  },
  render: (Slots: ISlots<ContextualMenuSlotProps>, renderData: ContextualMenuRenderData, ...children: React.ReactNode[]) => {
    if (renderData.state == undefined) {
      return null;
    }

    const menu: NativeMenuItem[] = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const imageSource = child.props.icon ? extractResolvedImageSourceFromIcon(child.props.icon) : null;

        return {
          title: child.props.text,
          ...(imageSource && { image: imageSource }), // Only pass in the prop if defined
          enabled: !child.props.disabled,
          tooltip: child.props.tooltip,
          identifier: child.props.itemKey,
          hasSubmenu: child.props.hasSubmenu,
          submenu: null,
        };
      }
    });

    return (
      <CMContext.Provider value={renderData.state.context}>
        <Slots.root menu={menu}>{children}</Slots.root>
      </CMContext.Provider>
    );
  },
});

export default ContextualMenu;
