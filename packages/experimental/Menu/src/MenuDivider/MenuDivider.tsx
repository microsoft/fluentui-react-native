/** @jsx withSlots */
import { View } from 'react-native';
import { compose, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { menuDividerName, MenuDividerProps, MenuDividerType } from './MenuDivider.types';
import { stylingSettings } from './MenuDivider.styling';

export const MenuDivider = compose<MenuDividerType>({
  displayName: menuDividerName,
  ...stylingSettings,
  slots: {
    root: View,
  },
  useRender: (userProps: MenuDividerProps, useSlots: UseSlots<MenuDividerType>) => {
    const Slots = useSlots(userProps);

    return (final: MenuDividerProps) => {
      return <Slots.root {...final} />;
    };
  },
});
