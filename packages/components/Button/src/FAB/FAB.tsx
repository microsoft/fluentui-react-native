/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { fabName, FABProps, FABType } from './FAB.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { compose, UseSlots } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';

export const FAB = compose<FABType>({
  displayName: fabName,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
  },
  useRender: (_userProps: FABProps, _useSlots: UseSlots<FABType>) => {
    return (_final: FABProps, ..._children: React.ReactNode[]) => {
      return null; // Only implemented for mobile endpoints
    };
  },
});
