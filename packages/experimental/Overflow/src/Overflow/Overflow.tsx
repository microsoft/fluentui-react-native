import * as React from 'react';
import { View } from 'react-native';

import { mergeProps, stagedComponent } from '@fluentui-react-native/framework';

import type { OverflowProps } from './Overflow.types';
import { overflowName } from './Overflow.types';
import { useOverflow } from './useOverflow';
import { OverflowContext } from '../OverflowContext';

export const Overflow = stagedComponent<OverflowProps>((initial: OverflowProps) => {
  const { props, state } = useOverflow(initial);
  return (final: OverflowProps, ...children: React.ReactNode[]) => {
    const mergedProps = mergeProps(props, final);
    return (
      <OverflowContext.Provider value={state}>
        <View {...mergedProps}>{children}</View>
      </OverflowContext.Provider>
    );
  };
});
Overflow.displayName = overflowName;

export default Overflow;
