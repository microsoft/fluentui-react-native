/** @jsxRuntime classic */
import * as React from 'react';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { stagedComponent } from '@fluentui-react-native/framework';

import type { OverflowItemProps } from './Overflow.types';
import { overflowItemName } from './Overflow.types';

export const OverflowItem = stagedComponent((_props: OverflowItemProps) => {
  return (_rest: OverflowItemProps, children: React.ReactNode) => {
    return <Button>{children}</Button>;
  };
});

OverflowItem.displayName = overflowItemName;

export default OverflowItem;
