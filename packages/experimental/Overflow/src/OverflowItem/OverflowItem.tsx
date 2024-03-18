/** @jsxRuntime classic */
import * as React from 'react';
import type { LayoutChangeEvent, StyleProp, ViewProps, ViewStyle } from 'react-native';

import { mergeProps, stagedComponent, memoize } from '@fluentui-react-native/framework';

import type { OverflowItemProps } from './OverflowItem.types';
import { overflowItemName } from './OverflowItem.types';
import { useOverflowItem } from './useOverflowItem';

const getOverflowItemProps = memoize(overflowItemPropWorker);
function overflowItemPropWorker(style: StyleProp<ViewStyle>, onLayout: (e: LayoutChangeEvent) => void): ViewProps {
  return { style, onLayout };
}

export const OverflowItem = stagedComponent<OverflowItemProps>((userProps: OverflowItemProps) => {
  const { props, state } = useOverflowItem(userProps);
  return (finalProps: OverflowItemProps, children: React.ReactNode) => {
    if (!state.visible) {
      return null;
    }

    finalProps = mergeProps(props, finalProps);
    const childrenArray = React.Children.toArray(children);
    const child = childrenArray[0];

    if (childrenArray.length !== 1 && __DEV__) {
      console.warn('OverflowItem can only have one child passed to it.');
    }

    if (!React.isValidElement(child)) {
      if (__DEV__) {
        console.warn('OverflowItem must receive a valid React Element as a child');
      }
      return null;
    }

    // Assume that the child can accept ViewProps.
    const viewProps = getOverflowItemProps(finalProps.style, finalProps.onLayout);

    const clone = React.cloneElement(child, viewProps);
    return clone;
  };
});
OverflowItem.displayName = overflowItemName;

export default OverflowItem;
