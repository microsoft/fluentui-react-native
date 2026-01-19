/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';

import type { ChipType, ChipProps } from './Chip.types';
import { chipName } from './Chip.types';

export const chipLookup = null;
export const Chip = compose<ChipType>({
  displayName: chipName,
  slots: {
    root: Pressable,
    icon: Icon,
    text: Text,
    iconPressable: Pressable,
  },
  useRender: (_userProps: ChipProps, _useSlots: UseSlots<ChipType>) => {
    console.warn('Chip is only implemented for Android');
    return (_final: ChipProps, ..._children: ReactNode[]) => {
      return null;
    };
  },
});

export default Chip;
