/** @jsx withSlots */
import * as React from 'react';
import { expanderName, ExpanderType, ExpanderProps, ExpanderViewProps, ExpanderChangeEvent } from './Expander.types';
import { compose, mergeProps, withSlots, UseSlots, buildProps } from '@fluentui-react-native/framework';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const ExpanderComponent = ensureNativeComponent('MSFExpanderView');
function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

export const Expander = compose<ExpanderType>({
  displayName: expanderName,
  tokens: [{}, expanderName],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(
      (tokens) => ({...tokens})
    ),
  },
  slots: { root: ExpanderComponent },
  render: (userProps: ExpanderProps, useSlots: UseSlots<ExpanderType>) => {
    const Root = useSlots(userProps).root;
    const [expandedState, setExpandedState] = React.useState(userProps.expanded);

    return (rest: ExpanderViewProps, ...children: React.ReactNode[]) => <Root
      height= {expandedState? userProps.expandedHeight : userProps.collapsedHeight}
      onChange={async (event: ExpanderChangeEvent) => {
        if (event.nativeEvent.expanded != null) {
          event.persist();
          if (!event.nativeEvent.expanded) {
            await delay(175);
          }
          setExpandedState(event.nativeEvent.expanded);
        }
      }}
      {...mergeProps(userProps, rest)}>{children}</Root>;
  },
});
