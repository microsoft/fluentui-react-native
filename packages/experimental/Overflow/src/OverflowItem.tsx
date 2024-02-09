/** @jsxRuntime classic */
import * as React from 'react';

import { stagedComponent } from '@fluentui-react-native/framework';

import type { OverflowItemProps } from './Overflow.types';
import { overflowItemName } from './Overflow.types';

export const OverflowItem = stagedComponent((_props: OverflowItemProps) => {
  return (_rest: OverflowItemProps, _children: React.ReactNode) => {
    return <></>;
  };
});

OverflowItem.displayName = overflowItemName;

export default OverflowItem;
