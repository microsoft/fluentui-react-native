/** @jsxImportSource @fluentui-react-native/framework-base */
import React from 'react';
import { Platform, View } from 'react-native';

import { FocusZone } from '@fluentui-react-native/focus-zone';
import { compose, mergeProps } from '@fluentui-react-native/framework';
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
            (child) =>
              React.isValidElement(child) &&
              (child as any).type.displayName !== 'MenuGroupHeader' &&
              (child as any).type.displayName !== 'MenuDivider',
          ).length;

          if ((child as any).type.displayName !== 'MenuGroupHeader' && (child as any).type.displayName !== 'MenuDivider') {
            itemPosition++;
          }
          return React.cloneElement(
            child as React.ReactElement<unknown, string | React.JSXElementConstructor<any>>,
            {
              accessibilityPosInSet: child.props.accessibilityPosInSet ?? itemPosition, // win32
              accessibilitySetSize: child.props.accessibilitySetSize ?? itemCount, //win32
            } as any,
          );
        }
        return child;
      });

      // Check if this MenuGroup has a MenuGroupHeader. If so, use the MenuGroupHeader
      // as the accessibilityLabel for the MenuGroup.
      const menuGroupHeader = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && (child as any).type.displayName === 'MenuGroupHeader',
      );

      // On win32, in order for assistive technology to read a group, it must have a name which is why
      // we use a string with a space as the default accessibilityLabel for MenuGroup.
      // If an empty string was used, the group context would not be read.
      let menuGroupA11yLabel = ' ';
      if (menuGroupHeader && typeof (menuGroupHeader as React.ReactElement).props.children === 'string') {
        menuGroupA11yLabel = (menuGroupHeader as React.ReactElement).props.children;
      }

      return (
        <Slots.root
          {...mergedProps}
          {...(Platform.OS == ('win32' as any) && {
            accessible: true,
            accessibilityRole: 'group' as any,
            accessibilityLabel: mergedProps.accessibilityLabel ?? menuGroupA11yLabel,
          })}
        >
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
