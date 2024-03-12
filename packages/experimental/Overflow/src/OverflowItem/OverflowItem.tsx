/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';

import { mergeProps, stagedComponent, withSlots } from '@fluentui-react-native/framework';

import type { OverflowItemProps } from './OverflowItem.types';
import { overflowItemName } from './OverflowItem.types';
import { useOverflowItem } from './useOverflowItem';

export const OverflowItem = stagedComponent<OverflowItemProps>((userProps: OverflowItemProps) => {
  const { props, state } = useOverflowItem(userProps);
  return (final: OverflowItemProps, ...children: React.ReactNode[]) => {
    const merged = mergeProps(props, final);
    if (!state.visible) {
      return null;
    }

    return <View {...merged}>{children}</View>;
  };
});
OverflowItem.displayName = overflowItemName;

export default OverflowItem;
