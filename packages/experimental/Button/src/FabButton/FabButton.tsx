/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { fabButtonName, FabButtonType } from './FabButton.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { compose, UseSlots } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import { ButtonCoreProps } from '../Button.types';

export const FabButton = compose<FabButtonType>({
  displayName: fabButtonName,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
  },
  render: (_userProps: ButtonCoreProps, _useSlots: UseSlots<FabButtonType>) => {
    return (_final: ButtonCoreProps, ..._children: React.ReactNode[]) => {
      return null;
    };
  },
});

export default FabButton;
