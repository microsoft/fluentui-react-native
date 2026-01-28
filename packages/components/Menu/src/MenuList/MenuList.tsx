/** @jsxImportSource @fluentui-react-native/framework-base */
import React from 'react';
import { Platform, ScrollView, View } from 'react-native';

import { FocusZone } from '@fluentui-react-native/focus-zone';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose } from '@fluentui-react-native/framework';

import { stylingSettings } from './MenuList.styling';
import type { MenuListProps, MenuListState, MenuListType } from './MenuList.types';
import { menuListName } from './MenuList.types';
import { useMenuList } from './useMenuList';
import { useMenuListContextValue } from './useMenuListContextValue';
import { MenuListProvider } from '../context/menuListContext';

const shouldHaveFocusZone = ['macos', 'win32'].includes(Platform.OS as string);
const focusLandsOnContainer = Platform.OS === 'macos';
const hasCircularNavigation = Platform.OS === ('win32' as any);

export const menuListLookup = (layer: string, state: MenuListState, userProps: MenuListProps): boolean => {
  return state[layer] || userProps[layer] || layer === 'hasMaxHeight';
};

export const MenuList = compose<MenuListType>({
  displayName: menuListName,
  ...stylingSettings,
  slots: {
    root: View,
    scrollView: ScrollView,
    focusZone: shouldHaveFocusZone ? FocusZone : View,
  },
  useRender: (userProps: MenuListProps, useSlots: UseSlots<MenuListType>) => {
    const menuList = useMenuList(userProps);
    const menuListContextValue = useMenuListContextValue(menuList);
    const Slots = useSlots(menuList.props, (layer) => menuListLookup(layer, menuList, userProps));

    return (_final: MenuListProps, children: React.ReactNode) => {
      const itemCount = React.Children.toArray(children).filter(
        (child) => React.isValidElement(child) && (child as any).type.displayName !== 'MenuDivider',
      ).length;
      let itemPosition = 0;

      const childrenWithSet = React.Children.toArray(children).map((child) => {
        if (React.isValidElement(child)) {
          if ((child as any).type.displayName !== 'MenuDivider') {
            itemPosition++;
          }

          return React.cloneElement(
            child as React.ReactElement<unknown, string | React.JSXElementConstructor<any>>,
            {
              accessibilityPositionInSet: (child as any).props.accessibilityPositionInSet ?? itemPosition, // win32
              accessibilitySetSize: (child as any).props.accessibilitySetSize ?? itemCount, //win32
              ...((child as any).props.tooltip && { alwaysShowToolTip: true }),
            } as any,
          );
        }

        return child;
      });

      const shouldHaveScrollView = Platform.OS === 'macos' || menuList.hasMaxHeight || menuList.hasMaxWidth;
      const ScrollViewWrapper = shouldHaveScrollView ? Slots.scrollView : React.Fragment;

      const hasMenuGroupChild = React.Children.toArray(children).some(
        (child) => child && (child as any).type && (child as any).type.displayName === 'MenuGroup',
      );

      // On win32, tab navigation should only be enabled when we have menu groups.
      const hasTabNavigation = Platform.OS === ('win32' as any) && hasMenuGroupChild;

      const content = (
        <Slots.root>
          <ScrollViewWrapper
            // avoid error that fires when props are passed into React.fragment
            {...(shouldHaveScrollView && {
              showsVerticalScrollIndicator: menuList.hasMaxHeight,
              showsHorizontalScrollIndicator: menuList.hasMaxWidth,
            })}
          >
            <Slots.focusZone
              // avoid error that fires when props are passed into React.fragment
              {...(shouldHaveFocusZone && {
                componentRef: focusLandsOnContainer && menuList.focusZoneRef,
                focusZoneDirection: 'vertical',
                defaultTabbableElement: focusLandsOnContainer && menuList.focusZoneRef,
                enableFocusRing: false,
                isCircularNavigation: hasCircularNavigation,
                tabKeyNavigation: hasTabNavigation ? 'Normal' : 'None',
              })}
            >
              {childrenWithSet}
            </Slots.focusZone>
          </ScrollViewWrapper>
        </Slots.root>
      );

      return <MenuListProvider value={menuListContextValue}>{content}</MenuListProvider>;
    };
  },
});
