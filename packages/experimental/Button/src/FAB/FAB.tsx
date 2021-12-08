/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { fabName, FABType } from './FAB.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { compose, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import { ButtonComposedCoreProps, ButtonCoreProps } from '../Button.types';
import { IFocusable } from '@fluentui-react-native/interactive-hooks';

const FABComposed = compose<FABType>({
  displayName: fabName,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
  },
  render: (_userProps: ButtonComposedCoreProps, _useSlots: UseSlots<FABType>) => {
    return (_final: ButtonComposedCoreProps, ..._children: React.ReactNode[]) => {
      return null; // Only implemented for mobile endpoints
    };
  },
});

export const FAB = React.forwardRef<IFocusable, ButtonCoreProps>((props, ref) => <FABComposed {...props} innerRef={ref} />);

export default FAB;
