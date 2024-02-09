/** @jsxRuntime classic */
import * as React from 'react';
import { View } from 'react-native';

import { stagedComponent } from '@fluentui-react-native/framework';

import type { OverflowProps } from './Overflow.types';
import { overflowName } from './Overflow.types';

export const Overflow = stagedComponent((_props: OverflowProps) => {
  return (_rest: OverflowProps, children: React.ReactNode) => {
    return <View>{children}</View>;
  };
});

Overflow.displayName = overflowName;

export default Overflow;
