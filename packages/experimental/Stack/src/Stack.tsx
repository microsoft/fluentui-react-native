/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import type { ViewProps } from 'react-native';

import { filterViewProps } from '@fluentui-react-native/adapters';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, withSlots, mergeProps, getTypedMemoCache } from '@fluentui-react-native/framework';

import { stylingSettings } from './Stack.styling';
import { stackName } from './Stack.types';
import type { StackProps, StackType, StackTokens } from './Stack.types';
import StackItem from './StackItem/StackItem';

// Needed for TS to understand that __jsiExecutorDescription exists.
declare global {
  /* eslint-disable-next-line @typescript-eslint/no-namespace*/
  namespace NodeJS {
    interface Global {
      __jsiExecutorDescription: any;
    }
  }
}

const mixinCache = getTypedMemoCache<ViewProps>();

/**
 * ensures that the object reference of the ViewProps is the same if the values of horizontal and gap are the same, this
 * avoids extraneous mutations of styles for the child objects
 */
function getMixinProps(horizontal: boolean, gap: StackTokens['gap']): ViewProps {
  return mixinCache(
    () => ({
      style: {
        ...(horizontal ? { marginLeft: gap } : { marginTop: gap }),
      },
    }),
    [horizontal, gap],
  )[0];
}

export const Stack = compose<StackType>({
  displayName: stackName,
  ...stylingSettings,
  statics: {
    Item: StackItem,
  },
  slots: {
    root: View,
    inner: View,
  },
  filters: {
    root: filterViewProps,
  },
  useRender: (props: StackProps, useSlots: UseSlots<StackType>) => {
    const { gap, horizontal, wrap, ...rest } = props;
    const Slots = useSlots(props);
    return (final: StackProps, ...children: React.ReactNode[]) => {
      if (gap && gap > 0 && children && global.__jsiExecutorDescription !== 'ChakraRuntime') {
        const mixinProps = getMixinProps(horizontal, gap);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
  },
});

export default Stack;
