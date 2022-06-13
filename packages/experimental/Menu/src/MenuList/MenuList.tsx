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

    return (_final: MenuListProps, children: React.ReactNode) => {
      // macOS needs an extra FocusZone slot to get proper keyboarding behavior with menus.
      const content =
        Platform.OS === 'macos' ? (
          <Slots.focusZone
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - FocusZoneProps inherits ViewProps, though on macOS they are supported
            enableFocusRing={false}
            componentRef={menuList.focusZoneRef}
            defaultTabbableElement={menuList.focusZoneRef}
            focusZoneDirection={'vertical'}
          >
            {children}
          </Slots.focusZone>
        ) : (
          { children }
        );

      return (
        <MenuListProvider value={contextValue}>
          <Slots.root>{content}</Slots.root>
        </MenuListProvider>
      );
    };
  },
});
