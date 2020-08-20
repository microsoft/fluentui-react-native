/** @jsx withSlots */
import * as React from 'react';
import { stackItemName, StackItemType, StackItemProps } from './StackItem.types';
import { compose, UseSlots, withSlots, mergeProps } from '@fluentui-react-native/framework';
import { View } from 'react-native';
import { stylingSettings } from './StackItem.styles';

export const StackItem = compose<StackItemType>({
  displayName: stackItemName,
  ...stylingSettings,
  slots: { root: View },
  render: (props: StackItemProps, useSlots: UseSlots<StackItemType>) => {
    const Root = useSlots(props).root;
    return (final: StackItemProps, ...children: React.ReactNode[]) => <Root {...mergeProps(props, final)}>{children}</Root>;
  },
});

export default StackItem;
