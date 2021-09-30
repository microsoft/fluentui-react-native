/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { buttonName, ButtonType, ButtonProps } from './Button.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings, getDefaultSize } from './Button.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useButton } from './useButton';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps, IPressableState } from '@fluentui-react-native/interactive-hooks';

/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the button.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the button
 * @param userProps The props that were passed into the button
 * @returns Whether the styles that are assigned to the layer should be applied to the button
 */
export const buttonLookup = (layer: string, state: IPressableState, userProps: ButtonProps): boolean => {
  return (
    state[layer] ||
    userProps[layer] ||
    (!userProps.fab && (layer === userProps['size'] || (!userProps['size'] && layer === getDefaultSize()))) ||
    (layer === 'hasContent' && userProps.content) ||
    (layer === 'hasIcon' && userProps.icon)
  );
};

export const Button = compose<ButtonType>({
  displayName: buttonName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
  },
  render: (userProps: ButtonProps, useSlots: UseSlots<ButtonType>) => {
    const button = useButton(userProps);
    const iconProps = createIconProps(userProps.icon);
    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => buttonLookup(layer, button.state, userProps));

    // now return the handler for finishing render
    return (final: ButtonProps, ...children: React.ReactNode[]) => {
      const { icon, content, ...mergedProps } = mergeProps(button.props, final);
      return (
        <Slots.root {...mergedProps}>
          {icon && <Slots.icon {...iconProps} />}
          {content && <Slots.content key="content">{content}</Slots.content>}
          {children}
        </Slots.root>
      );
    };
  },
});

export default Button;
