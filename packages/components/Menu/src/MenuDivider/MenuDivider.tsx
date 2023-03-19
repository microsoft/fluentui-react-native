/** @jsx withSlots */
import { Platform, View } from 'react-native';

import { Divider } from '@fluentui-react-native/divider';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, withSlots } from '@fluentui-react-native/framework';

import { stylingSettings } from './MenuDivider.styling';
import type { MenuDividerProps, MenuDividerType } from './MenuDivider.types';
import { menuDividerName } from './MenuDivider.types';

export const MenuDivider = compose<MenuDividerType>({
  displayName: menuDividerName,
  ...stylingSettings,
  slots: {
    root: View,
  },
  useRender: (userProps: MenuDividerProps, useSlots: UseSlots<MenuDividerType>) => {
    const Slots = useSlots(userProps);

    return (final: MenuDividerProps) => {
      if (Platform.OS === 'android') return <Divider insetSize={userProps.insetSize} />;

      return <Slots.root {...final} />;
    };
  },
});
