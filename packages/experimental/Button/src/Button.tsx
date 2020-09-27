/** @jsx withSlots */
import * as React from 'react';
import { Image, View, ViewProps } from 'react-native';
import { ButtonProps, buttonName, ButtonType } from './Button.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './Button.styling';
import { filterViewProps, filterImageProps } from '@fluentui-react-native/adapters';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useButton } from './useButton';

export const Button = compose<ButtonType>({
  displayName: buttonName,
  ...stylingSettings,
  slots: {
    root: View,
    stack: View,
    icon: Image,
    content: Text,
  },
  filters: {
    stack: filterViewProps,
    icon: filterImageProps,
  },
  render: (userProps: ButtonProps, useSlots: UseSlots<ButtonType>) => {
    const { icon, content, ...rest } = userProps;

    const button = useButton(rest);

    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => button.state[layer] || userProps[layer]);

    // now return the handler for finishing render
    return (final: ButtonProps, ...children: React.ReactNode[]) => {
      const mergedProps = mergeProps(button.props, final);

      return (
        <Slots.root {...mergedProps}>
          <Slots.stack>
            {icon && <Slots.icon key="icon" source={{ uri: icon }} />}
            {content && <Slots.content key="content">{content}</Slots.content>}
            {children}
          </Slots.stack>
        </Slots.root>
      );
    };
  },
});

export default Button;
