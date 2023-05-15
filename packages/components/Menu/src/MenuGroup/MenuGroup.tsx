/** @jsx withSlots */
import React from 'react';
import { View } from 'react-native';

import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import type { UseSlots } from '@fluentui-react-native/framework';

import type { MenuGroupProps, MenuGroupType } from './MenuGroup.types';
import { menuGroupName } from './MenuGroup.types';

export const MenuGroup = compose<MenuGroupType>({
  displayName: menuGroupName,
  slots: {
    root: View,
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
      return <Slots.root {...mergedProps}>{childrenWithSet}</Slots.root>;
    };
  },
});
