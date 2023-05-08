/** @jsx withSlots */
import { ScrollView } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { Text } from '@fluentui-react-native/text';

import { stylingSettings } from './DrawerV1.styling';
import type { DrawerV1Type, DrawerV1Props } from './DrawerV1.types';
import { DrawerV1Name } from './DrawerV1.types';
import { useDrawerV1 } from './useDrawerV1';

export const DrawerV1 = compose<DrawerV1Type>({
  displayName: DrawerV1Name,
  ...stylingSettings,
  slots: {
    root: ScrollView,
  },
  useRender: (userProps: DrawerV1Props, useSlots: UseSlots<DrawerV1Type>) => {
    const DrawerV1 = useDrawerV1(userProps);
    const Slots = useSlots(userProps);

    return (final: DrawerV1Props) => {
      const { ...mergedProps } = mergeProps(DrawerV1.props, final);

      return (
        <Slots.root {...mergedProps}>
          <Text>Hello from Drawer</Text>
        </Slots.root>
      );
    };
  },
});
