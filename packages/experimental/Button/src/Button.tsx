/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { buttonName, ButtonType, ButtonProps, ButtonComposedProps } from './Button.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings, getDefaultSize } from './Button.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useButton } from './useButton';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps, IFocusable, IPressableState } from '@fluentui-react-native/interactive-hooks';

/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the button.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the button
 * @param userProps The props that were passed into the button
 * @returns Whether the styles that are assigned to the layer should be applied to the button
 */
export const buttonLookup = (layer: string, state: IPressableState, userProps: ButtonComposedProps): boolean => {
  return (
    state[layer] ||
    userProps[layer] ||
    layer === userProps['appearance'] ||
    layer === userProps['size'] ||
    (!userProps['size'] && layer === getDefaultSize()) ||
    layer === userProps['shape'] ||
    (!userProps['shape'] && layer === 'rounded') ||
    (layer === 'hasContent' && userProps.content) ||
    (layer === 'hasIcon' && userProps.icon)
  );
};

const ButtonCompose = compose<ButtonType>({
  displayName: buttonName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
  },
  render: (userProps: ButtonComposedProps, useSlots: UseSlots<ButtonType>) => {
    const button = useButton(userProps);
    const iconProps = createIconProps(userProps.icon);
    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => buttonLookup(layer, button.state, userProps));

    // now return the handler for finishing render
    return (final: ButtonComposedProps, ...children: React.ReactNode[]) => {
      const { icon, iconPosition, content, ...mergedProps } = mergeProps(button.props, final);
      return (
        <Slots.root {...mergedProps}>
          {icon && iconPosition === 'before' && <Slots.icon {...iconProps} />}
          {content && <Slots.content key="content">{content}</Slots.content>}
          {children}
          {icon && iconPosition === 'after' && <Slots.icon {...iconProps} />}
        </Slots.root>
      );
    };
  },
});

export const Button = React.forwardRef<IFocusable, ButtonProps>((props, ref) => <ButtonCompose {...props} innerRef={ref} />);

export default Button;
