/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { fabName, FABType } from './FAB.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { compose, UseSlots } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import { ButtonComposeCoreProps } from '../Button.types';

export const FAB = compose<FABType>({
  displayName: fabName,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
  },
  render: (_userProps: ButtonComposeCoreProps, _useSlots: UseSlots<FABType>) => {
    return (_final: ButtonComposeCoreProps, ..._children: React.ReactNode[]) => {
      return null; // Only implemented for mobile endpoints
    };
  },
});

export default FAB;
