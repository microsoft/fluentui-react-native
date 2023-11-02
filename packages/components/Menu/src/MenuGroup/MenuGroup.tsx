/** @jsxRuntime classic */
/** @jsx withSlots */
import React from 'react';
import { Platform, View } from 'react-native';

import { FocusZone } from '@fluentui-react-native/focus-zone';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import type { UseSlots } from '@fluentui-react-native/framework';

import type { MenuGroupProps, MenuGroupType } from './MenuGroup.types';
import { menuGroupName } from './MenuGroup.types';

// Intentionally not enabled on macOS to match system context menus
const hasFocusZone = ['win32'].includes(Platform.OS as string);

export const MenuGroup = compose<MenuGroupType>({
  displayName: menuGroupName,
  slots: {
    root: View,
    contentWrapper: hasFocusZone ? FocusZone : React.Fragment,
  },
  useRender: (userProps: MenuGroupProps, useSlots: UseSlots<MenuGroupType>) => {
    const Slots = useSlots(userProps);
    return (final: MenuGroupProps, children: React.ReactNode) => {
      const { ...mergedProps } = mergeProps(userProps, final);

      let itemPosition = 0;
      const childrenWithSet = React.Children.toArray(children).map((child) => {
        if (React.isValidElement(child)) {
          const itemCount = React.Children.toArray(children).filter(
            (child) => React.isValidElement(child) && (child as any).type.displayName !== 'MenuGroupHeader',
          ).length;

          if ((child as any).type.displayName !== 'MenuGroupHeader') {
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

      return (
        <Slots.root {...mergedProps}>
          <Slots.contentWrapper
            // avoid error that fires when props are passed into React.fragment
            {...(hasFocusZone && {
              focusZoneDirection: 'vertical',
              enableFocusRing: false,
              navigateAtEnd: 'NavigateContinue',
            })}
          >
            {childrenWithSet}
          </Slots.contentWrapper>
        </Slots.root>
      );
    };
  },
});
