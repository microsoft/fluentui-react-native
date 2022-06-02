/** @jsx withSlots */
import React from 'react';
import { Platform, View } from 'react-native';
import { compose, mergeProps, stagedComponent, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { menuListName, MenuListProps, MenuListType } from './MenuList.types';
import { stylingSettings } from './MenuList.styling';
import { MenuListProvider } from '../context/menuListContext';
import { useMenuList } from './useMenuList';
import { useMenuListContextValue } from './useMenuListContextValue';
import { IViewProps } from '@fluentui-react-native/adapters';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import { IFocusable } from '@fluentui-react-native/interactive-hooks';

const MenuStack = stagedComponent((props: React.PropsWithRef<IViewProps> & { gap?: number }) => {
  const { gap, ...rest } = props;
  return (final: React.PropsWithRef<IViewProps> & { gap?: number }, children: React.ReactNode) => {
    if (gap && gap > 0 && children) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - GH:1684, fix typing error
      children = React.Children.map(children, (child: React.ReactChild, index: number) => {
        if (React.isValidElement(child) && index > 0) {
          return React.cloneElement(child, mergeProps(child.props, { style: { marginTop: gap } }));
        }
        return child;
      });
    }

    return <View {...mergeProps(rest, final)}>{children}</View>;
  };
});
MenuStack.displayName = 'MenuStack';

export const MenuList = compose<MenuListType>({
  displayName: menuListName,
  ...stylingSettings,
  slots: {
    root: MenuStack,
    focusZone: FocusZone,
  },
  useRender: (userProps: MenuListProps, useSlots: UseSlots<MenuListType>) => {
    const menuList = useMenuList(userProps);
    const contextValue = useMenuListContextValue(menuList);
    const Slots = useSlots(menuList);

    /**
     * On macOS, focus isn't placed by default on the first focusable element. We get around this by focusing on the inner FocusZone
     * hosting the menu. For whatever reason, to get the timing _just_ right to actually focus, we need an additional `setTimeout`
     *  on top of the `useLayoutEffect` hook.
     */
    const focusZoneRef = React.useRef<IFocusable>(null);

    React.useLayoutEffect(() => {
      if (Platform.OS === 'macos') {
        setTimeout(() => {
          focusZoneRef.current?.focus();
        }, 0);
      }
    });

    return (_final: MenuListProps, children: React.ReactNode) => {
      if (Platform.OS === 'macos') {
        return (
          <MenuListProvider value={contextValue}>
            <Slots.root>
              <Slots.focusZone
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                enableFocusRing={false}
                componentRef={focusZoneRef}
                defaultTabbableElement={focusZoneRef}
                focusZoneDirection={'vertical'}
              >
                {children}
              </Slots.focusZone>
            </Slots.root>
          </MenuListProvider>
        );
      } else {
        return (
          <MenuListProvider value={contextValue}>
            <Slots.root>{children}</Slots.root>
          </MenuListProvider>
        );
      }
    };
  },
});
