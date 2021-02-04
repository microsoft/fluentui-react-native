/** @jsx withSlots */
import * as React from 'react';
import { nativeButtonName, NativeButtonType, NativeButtonProps, NativeButtonViewProps } from './NativeButton.types';
import { Button } from '@fluentui-react-native/experimental-button';
import { compose, mergeProps, withSlots, UseSlots, buildProps } from '@fluentui-react-native/framework';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const NativeButtonComponent = ensureNativeComponent('MSFButtonView');

export const NativeButton = compose<NativeButtonType>({
  displayName: nativeButtonName,
  tokens: [{}, nativeButtonName],
  slotProps: {
    root: buildProps(
      (tokens) => ({
        style: {
          height: 35,
          width: 200,
          margin: 10,
        },
        ...tokens,
      }),
      [],
    ),
  },
  slots: { root: NativeButtonComponent },
  render: (userProps: NativeButtonProps, useSlots: UseSlots<NativeButtonType>) => {
    const Root = useSlots(userProps).root;
    return (rest: NativeButtonViewProps, ...children: React.ReactNode[]) => <Root {...mergeProps(userProps, rest)}>{children}</Root>;
  },
});

export default Button;
