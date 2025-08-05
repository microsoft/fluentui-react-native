/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';

import { stylingSettings } from './StackItem.styles';
import { stackItemName } from './StackItem.types';
import type { StackItemType, StackItemProps } from './StackItem.types';

export const StackItem = compose<StackItemType>({
  displayName: stackItemName,
  ...stylingSettings,
  slots: { root: View },
  useRender: (props: StackItemProps, useSlots: UseSlots<StackItemType>) => {
    const Root = useSlots(props).root;
    return (final: StackItemProps, ...children: React.ReactNode[]) => <Root {...mergeProps(props, final)}>{children}</Root>;
  },
});

export default StackItem;
