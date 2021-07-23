/** @jsx withSlots */
import * as React from 'react';
import { expanderName, ExpanderType, ExpanderProps, ExpanderViewProps, ExpanderChangeEvent, ExpanderState } from './Expander.types';
import { compose, mergeProps, withSlots, UseSlots, buildProps } from '@fluentui-react-native/framework';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { stylingSettings } from './Expander.styling';
import { useAsToggle } from '@fluentui-react-native/interactive-hooks';

const ExpanderComponent = ensureNativeComponent('MSFExpanderView');
// const [expandedState, setExpandedState] = React.useState(false);
// function delay(ms: number) {
//   return new Promise( resolve => setTimeout(resolve, ms) );
// }

const useExpander = (userProps: ExpanderProps): ExpanderState => {
  return {
    props: {
      ...userProps
    },
    state: {
      expanded: true
    }
  }
}

export const Expander = compose<ExpanderType>({
  displayName: expanderName,
  ...stylingSettings,
  // tokens: [{}, expanderName],
  // tokensThatAreAlsoProps,
  // slotProps: {
  //   root: buildProps(
  //     (tokens) => ({
  //       style: {
  //         height: expandedState? tokens.expandedHeight : tokens.collapsedHeight
  //       },
  //       onChange: async function onChange (event: ExpanderChangeEvent) {
  //         if (event.nativeEvent.expanded != null) {
  //           event.persist();
  //           if (!event.nativeEvent.expanded) {
  //             await delay(200);
  //           }
  //           setExpandedState(event.nativeEvent.expanded);
  //         }
  //       },
  //       ...tokens,
  //     }),
  //     [],
  //   ),
  // },
  slots: { root: ExpanderComponent },
  render: (userProps: ExpanderProps, useSlots: UseSlots<ExpanderType>) => {
    const { isExpanded, onChange, ...rest } = userProps;
    // const Root = useSlots(userProps).root;
    // const [expandedState, setExpandedState] = React.useState(userProps.expanded);

    const [expandedValue, toggle] = useAsToggle(true, isExpanded, onChange);
    const expander = useExpander({onChange: toggle, ...rest});
    const Slots = useSlots(userProps, (layer) => (layer === 'expandedState' && expandedValue) || expander.state[layer] || userProps[layer]);

    return (rest: ExpanderViewProps, ...children: React.ReactNode[]) => <Slots.root
      // style={{
      //   height: expandedState? userProps.expandedHeight : userProps.collapsedHeight
      // }}
      // onChange={async function onChange (event: ExpanderChangeEvent) {
      //   if (event.nativeEvent.expanded != null) {
      //     event.persist();
      //     if (!event.nativeEvent.expanded) {
      //       await delay(200);
      //     }
      //     setExpandedState(event.nativeEvent.expanded);
      //   }
      // }}
      {...mergeProps(userProps, rest)}>{children}</Slots.root>;
  },
});
