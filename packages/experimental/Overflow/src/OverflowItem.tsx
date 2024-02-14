/** @jsxRuntime classic */
import * as React from 'react';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { mergeProps, stagedComponent } from '@fluentui-react-native/framework';

import type { OverflowItemProps } from './Overflow.types';
import { overflowItemName } from './Overflow.types';
import { useOverflowItem } from './useOverflowItem';

export const OverflowItem = stagedComponent((initial: OverflowItemProps) => {
  const { props, state } = useOverflowItem(initial);
  return (rest: OverflowItemProps, children: React.ReactNode) => {
    const merged = mergeProps(props, rest);
    if (!state.visible) {
      return null;
    }
    return <Button {...merged}>{children}</Button>;
  };
});

OverflowItem.displayName = overflowItemName;

export default OverflowItem;
