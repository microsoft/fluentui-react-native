/** @jsx withSlots */
import * as React from 'react';
import { Image, View } from 'react-native';
import { buttonName, ButtonType, ButtonTypeMac, ButtonMacProps, NativeButtonProps, ButtonProps } from './Button.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './Button.styling';
import { filterImageProps } from '@fluentui-react-native/adapters';
import { compose, mergeProps, withSlots, UseSlots, buildProps } from '@fluentui-react-native/framework';
import { useButton } from './useButton';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { Platform } from 'react-native';

const NativeButton = ensureNativeComponent('MSFButtonView');

export const Button =
  Platform.OS === 'macos'
    ? compose<ButtonTypeMac>({
        displayName: buttonName,
        tokens: [{}, buttonName],
        slotProps: {
          root: buildProps((tokens) => ({ ...tokens }), []),
        },
        slots: { root: NativeButton },
        render: (userProps: ButtonMacProps, useSlots: UseSlots<ButtonTypeMac>) => {
          const Root = useSlots(userProps).root;
          return (rest: NativeButtonProps, ...children: React.ReactNode[]) => <Root {...mergeProps(userProps, rest)}>{children}</Root>;
        },
      })
    : compose<ButtonType>({
        displayName: buttonName,
        ...stylingSettings,
        slots: {
          root: View,
          icon: Image,
          content: Text,
        },
        filters: {
          icon: filterImageProps,
        },
        render: (userProps: ButtonProps, useSlots: UseSlots<ButtonType>) => {
          const button = useButton(userProps);
          // grab the styled slots
          const Slots = useSlots(userProps, (layer) => button.state[layer] || userProps[layer]);
          // now return the handler for finishing render
          return (final: ButtonProps, ...children: React.ReactNode[]) => {
            const { icon, content, ...mergedProps } = mergeProps(button.props, final);

            return (
              <Slots.root {...mergedProps}>
                {icon && <Slots.icon key="icon" source={{ uri: icon }} />}
                {content && <Slots.content key="content">{content}</Slots.content>}
                {children}
              </Slots.root>
            );
          };
        },
      });

export default Button;
