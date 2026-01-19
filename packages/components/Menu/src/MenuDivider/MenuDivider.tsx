/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose } from '@fluentui-react-native/framework';

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
      return <Slots.root {...final} />;
    };
  },
});
