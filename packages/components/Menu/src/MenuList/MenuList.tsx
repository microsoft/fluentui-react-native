/** @jsxRuntime classic */
/** @jsx withSlots */
import React from 'react';
import { Platform, ScrollView, View } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, stagedComponent, withSlots } from '@fluentui-react-native/framework';

import { stylingSettings } from './MenuList.styling';
import type { MenuListProps, MenuListState, MenuListType } from './MenuList.types';
import { menuListName } from './MenuList.types';
import { useMenuList } from './useMenuList';
import { useMenuListContextValue } from './useMenuListContextValue';
import { useMenuContext } from '../context';
import { MenuListProvider } from '../context/menuListContext';

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

export const menuListLookup = (layer: string, state: MenuListState, userProps: MenuListProps): boolean => {
  return state[layer] || userProps[layer] || layer === 'hasMaxHeight';
};
export const MenuList = compose<MenuListType>({
  displayName: menuListName,
  ...stylingSettings,
  slots: {
    root: MenuStack,
    scrollView: ScrollView,
    ...(Platform.OS === 'macos' && { focusZone: FocusZone }),
  },
  useRender: (userProps: MenuListProps, useSlots: UseSlots<MenuListType>) => {
    const menuList = useMenuList(userProps);
    const menuContext = useMenuContext();
    const menuListContextValue = useMenuListContextValue(menuList);
    const Slots = useSlots(menuList.props, (layer) => menuListLookup(layer, menuList, userProps));

    const focusZoneRef = React.useRef<View>();
    const setFocusZoneFocus = () => {
      focusZoneRef?.current?.focus();
    };

    React.useEffect(() => {
      setFocusZoneFocus();
    }, []);

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
              accessibilityPositionInSet: child.props.accessibilityPositionInSet ?? itemPosition, // win32
              accessibilitySetSize: child.props.accessibilitySetSize ?? itemCount, //win32
            } as any,
          );
        }

        return child;
      });

      const content =
        Platform.OS === 'macos' ? (
          <Slots.root onMouseLeave={setFocusZoneFocus} onKeyDown={menuList.onListKeyDown}>
            <Slots.scrollView
              showsVerticalScrollIndicator={menuContext.hasMaxHeight}
              showsHorizontalScrollIndicator={menuContext.hasMaxWidth}
            >
              <Slots.focusZone
                componentRef={focusZoneRef}
                focusZoneDirection={'vertical'}
                defaultTabbableElement={focusZoneRef} // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore FocusZone takes ViewProps, but that isn't defined on it's type.
                enableFocusRing={false}
              >
                {childrenWithSet}
              </Slots.focusZone>
            </Slots.scrollView>
          </Slots.root>
        ) : menuContext.hasMaxHeight ? (
          <Slots.root onKeyDown={menuList.onListKeyDown} style={menuContext.minWidth ? { minWidth: menuContext.minWidth } : {}}>
            <Slots.scrollView>{childrenWithSet}</Slots.scrollView>
          </Slots.root>
        ) : (
          <Slots.root onKeyDown={menuList.onListKeyDown} style={menuContext.minWidth ? { minWidth: menuContext.minWidth } : {}}>
            {childrenWithSet}
          </Slots.root>
        );

      return <MenuListProvider value={menuListContextValue}>{content}</MenuListProvider>;
    };
  },
});
