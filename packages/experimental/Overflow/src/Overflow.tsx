/** @jsxRuntime classic */
import * as React from 'react';

import { stagedComponent } from '@fluentui-react-native/framework';

import type { OverflowProps } from './Overflow.types';
import { overflowName } from './Overflow.types';

export const Overflow = stagedComponent((_props: OverflowProps) => {
  return (_rest: OverflowProps, _children: React.ReactNode) => {
    return <></>;
  };
});

Overflow.displayName = overflowName;

export default Overflow;
