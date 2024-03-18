/** @jsxRuntime classic */
import * as React from 'react';
import { View } from 'react-native';
import type { DimensionValue } from 'react-native';

import { mergeProps, stagedComponent, memoize } from '@fluentui-react-native/framework';

import type { OverflowProps } from './Overflow.types';
import { overflowName } from './Overflow.types';
import { useOverflow } from './useOverflow';
import { OverflowContext } from '../OverflowContext';

export const getOverflowStyleProps = memoize(overflowStylePropsWorker);
function overflowStylePropsWorker(
  dontHideBeforeReady: boolean,
  initialOverflowLayoutDone: boolean,
  padding?: DimensionValue,
): Partial<OverflowProps> {
  return {
    style: {
      opacity: dontHideBeforeReady || initialOverflowLayoutDone ? 1 : 0,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: padding,
    },
  };
}

export const Overflow = stagedComponent<OverflowProps>((initial: OverflowProps) => {
  const { props, state } = useOverflow(initial);
  return (final: OverflowProps, ...children: React.ReactNode[]) => {
    const { itemIDs: _, ...mergedProps } = mergeProps(
      props,
      final,
      getOverflowStyleProps(props.dontHideBeforeReady, state.initialOverflowLayoutDone, props.padding),
    );
    return (
      <OverflowContext.Provider value={state}>
        <View {...mergedProps}>{children}</View>
      </OverflowContext.Provider>
    );
  };
});
Overflow.displayName = overflowName;

export default Overflow;
