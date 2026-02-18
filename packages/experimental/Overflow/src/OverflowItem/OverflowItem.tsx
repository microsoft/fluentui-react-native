import * as React from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

import { mergeProps, directComponent, phasedComponent, memoize, mergeStyles, extractStyle } from '@fluentui-react-native/framework-base';

import type { OverflowItemProps } from './OverflowItem.types';
import { overflowItemName } from './OverflowItem.types';
import { useOverflowItem } from './useOverflowItem';

const getOverflowItemProps = memoize(overflowItemPropWorker);
function overflowItemPropWorker(props: ViewProps, style: StyleProp<ViewStyle>): ViewProps {
  return { ...props, style };
}

export const OverflowItem = phasedComponent<OverflowItemProps>((userProps: OverflowItemProps) => {
  const { props, state } = useOverflowItem(userProps);
  return directComponent<OverflowItemProps>((finalProps: OverflowItemProps) => {
    const { children, ...rest } = finalProps;
    if (state.layoutDone && !state.visible) {
      return null;
    }

    const mergedProps = mergeProps(props, rest);
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
    const viewStyles = mergeStyles<ViewStyle>(extractStyle(child), mergedProps.style);
    const viewProps = getOverflowItemProps(mergedProps, viewStyles);

    const clone = React.cloneElement(child, viewProps);
    return clone;
  });
});
OverflowItem.displayName = overflowItemName;

export default OverflowItem;
