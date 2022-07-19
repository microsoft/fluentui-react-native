/** @jsx withSlots */
import React from 'react';
import { View } from 'react-native';
import { compose, mergeProps, stagedComponent, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { menuListName, MenuListProps, MenuListType } from './MenuList.types';
import { stylingSettings } from './MenuList.styling';
import { MenuListProvider } from '../context/menuListContext';
import { useMenuList } from './useMenuList';
import { useMenuListContextValue } from './useMenuListContextValue';
import { IViewProps } from '@fluentui-react-native/adapters';

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
  },
  useRender: (userProps: MenuListProps, useSlots: UseSlots<MenuListType>) => {
    const menuList = useMenuList(userProps);
    const contextValue = useMenuListContextValue(menuList);
    const Slots = useSlots(menuList.props);

    return (_final: MenuListProps, children: React.ReactNode) => {
      return (
        <MenuListProvider value={contextValue}>
          <Slots.root>{children}</Slots.root>
        </MenuListProvider>
      );
    };
  },
});
