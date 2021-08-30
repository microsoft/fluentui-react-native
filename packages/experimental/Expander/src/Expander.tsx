/** @jsx withSlots */
import * as React from 'react';
import { expanderName, ExpanderType, ExpanderProps, ExpanderViewProps } from './Expander.types';
import { compose, mergeProps, withSlots, UseSlots, buildProps } from '@fluentui-react-native/framework';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const ExpanderComponent = ensureNativeComponent('ExpanderView');

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

export const Expander = compose<ExpanderType>({
  displayName: expanderName,
  tokens: [{}, expanderName],
  slotProps: {
    root: buildProps(
      (tokens) => ({...tokens})
    ),
  },
  slots: { root: ExpanderComponent },
  render: (userProps: ExpanderProps, useSlots: UseSlots<ExpanderType>) => {
    const Root = useSlots(userProps).root;
    const [expandedState, setExpandedState] = React.useState(userProps.expanded);
    const expanderHeight = expandedState? userProps.expandedHeight : userProps.collapsedHeight;

    const _onCollapsing = async () => {
      userProps.onCollapsing?.();
      // Need to delay the height change so that the animation runs
      await delay(175);
      setExpandedState(false);
    }

    const _onExpanding = () => {
      setExpandedState(true);
      userProps.onExpanding?.();
    }

    return (rest: ExpanderViewProps, ...children: React.ReactNode[]) =>
      <Root
        {...mergeProps(userProps, rest)}
        height={expanderHeight}
        onCollapsing={_onCollapsing}
        onExpanding={_onExpanding}>
        {children}
      </Root>;
  },
});
