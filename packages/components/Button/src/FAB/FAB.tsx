/** @jsx withSlots */
import * as React from 'react';
import { Pressable } from 'react-native';
import { fabName, FABType } from './FAB.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { compose, UseSlots } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import { ButtonCoreProps } from '../Button.types';

export const FAB = compose<FABType>({
  displayName: fabName,
  slots: {
    root: Pressable,
    icon: Icon,
    content: Text,
  },
  useRender: (_userProps: ButtonCoreProps, _useSlots: UseSlots<FABType>) => {
    return (_final: ButtonCoreProps, ..._children: React.ReactNode[]) => {
      return null; // Only implemented for mobile endpoints
    };
  },
});
