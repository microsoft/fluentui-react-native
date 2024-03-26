/** @jsxRuntime classic */
import * as React from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { mergeProps, mergeStyles, stagedComponent, memoize } from '@fluentui-react-native/framework';

import type { OverflowProps } from './Overflow.types';
import { overflowName } from './Overflow.types';
import { useOverflow } from './useOverflow';
import { OverflowContext } from '../OverflowContext';

const defaultStyles: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
};

export const getOverflowStyleProps = memoize(overflowStylePropsWorker);
function overflowStylePropsWorker(props: OverflowProps, initialOverflowLayoutDone: boolean): Partial<OverflowProps> {
  const { dontHideBeforeReady, style, padding } = props;
  return {
    style: mergeStyles(defaultStyles, style, {
      opacity: dontHideBeforeReady || initialOverflowLayoutDone ? 1 : 0,
      padding: padding,
    } as StyleProp<ViewStyle>),
  };
}

export const Overflow = stagedComponent<OverflowProps>((initial: OverflowProps) => {
  const { props, state } = useOverflow(initial);
  return (final: OverflowProps, ...children: React.ReactNode[]) => {
    const { itemIDs: _, ...mergedProps } = mergeProps(props, final, getOverflowStyleProps(props, state.initialOverflowLayoutDone));
    return (
      <OverflowContext.Provider value={state}>
        <View {...mergedProps}>{children}</View>
      </OverflowContext.Provider>
    );
  };
});
Overflow.displayName = overflowName;

export default Overflow;
