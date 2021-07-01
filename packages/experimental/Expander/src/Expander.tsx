/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { expanderName, ExpanderType, ExpanderProps, ExpanderViewProps } from './Expander.types';
import { compose, mergeProps, withSlots, UseSlots, buildProps } from '@fluentui-react-native/framework';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const ExpanderComponent = ensureNativeComponent('MSFExpanderView');

export const Expander = compose<ExpanderType>({
  displayName: expanderName,
  tokens: [{}, expanderName],
  slotProps: {
    root: buildProps(
      (tokens, theme) => ({
        style: {
          height: 500,
          width: 500,
          margin: 8,
        },
        accentColor: theme.colors.accentButtonBackground,
        ...tokens,
      }),
      [],
    ),
  },
  slots: { root: ExpanderComponent },
  render: (userProps: ExpanderProps, useSlots: UseSlots<ExpanderType>) => {
    const Root = useSlots(userProps).root;
    return (rest: ExpanderViewProps, ...children: React.ReactNode[]) => <Root {...mergeProps(userProps, rest)}><View>{children}</View></Root>;
  },
});
