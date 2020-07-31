/** @jsx withSlots */
import * as React from 'react';
import StackItem from './StackItem/StackItem';
import { StackProps, stackName, StackType, StackTokens } from './Stack.types';
import { View, ViewProps } from 'react-native';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { compose, withSlots, mergeProps, UseSlots, getMemoCache } from '@fluentui-react-native/experimental-framework';
import { stylingSettings } from './Stack.styling';

const mixinCache = getMemoCache<ViewProps>();

/**
 * ensures that the object reference of the ViewProps is the same if the values of horizontal and gap are the same, this
 * avoids extraneous mutations of styles for the child objects
 */
function getMixinProps(horizontal: boolean, gap: StackTokens['gap']): ViewProps {
  return mixinCache(
    () => ({
      style: {
        ...(horizontal ? { marginLeft: gap } : { marginTop: gap })
      }
    }),
    [horizontal, gap]
  )[0];
}

export const Stack = compose<StackType>({
  displayName: stackName,
  ...stylingSettings,
  statics: {
    Item: StackItem
  },
  slots: {
    root: View,
    inner: View
  },
  filters: {
    root: filterViewProps
  },
  render: (props: StackProps, useSlots: UseSlots<StackType>) => {
    const { gap, horizontal, wrap, ...rest } = props;
    const Slots = useSlots(props);
    return (final: StackProps, ...children: React.ReactNode[]) => {
      if (gap && gap > 0 && children) {
        const mixinProps = getMixinProps(horizontal, gap);

        /* eslint-disable @typescript-eslint/ban-ts-ignore */
        // @ts-ignore - TODO, fix typing error
        children = React.Children.map(children, (child: React.ReactChild, index: number) => {
          if (React.isValidElement(child) && index > 0) {
            return React.cloneElement(child, mergeProps(child.props, mixinProps));
          }
          return child;
        });
      }

      if (wrap) {
        return (
          <Slots.root {...mergeProps(rest, final)}>
            <Slots.inner>{children}</Slots.inner>
          </Slots.root>
        );
      }
      return <Slots.root {...mergeProps(rest, final)}>{children}</Slots.root>;
    };
  }
});

export default Stack;
