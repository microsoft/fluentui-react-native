/** @jsx withSlots */
import React from 'react';
import { View } from 'react-native';

import { compose, withSlots } from '@fluentui-react-native/framework';
import type { UseSlots } from '@fluentui-react-native/framework';

import { stylingSettings } from './MenuGroup.styling';
import type { MenuGroupProps, MenuGroupType } from './MenuGroup.types';
import { menuGroupName } from './MenuGroup.types';

export const MenuGroup = compose<MenuGroupType>({
  displayName: menuGroupName,
  ...stylingSettings,
  slots: {
    root: View,
  },
  useRender: (userProps: MenuGroupProps, useSlots: UseSlots<MenuGroupType>) => {
    const Slots = useSlots(userProps);

    return (_final: MenuGroupProps, children: React.ReactNode) => {
      const content = <Slots.root>{children}</Slots.root>;

      return <Slots.root>{content}</Slots.root>;
    };
  },
});
