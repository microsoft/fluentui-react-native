/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { ActivityIndicator } from '@fluentui-react-native/experimental-activity-indicator';
import { buttonName, ButtonType, ButtonProps, ButtonPropsWithInnerRef } from './Button.types';
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
export const buttonLookup = (layer: string, state: IPressableState, userProps: ButtonPropsWithInnerRef): boolean => {
  return (
    state[layer] ||
    userProps[layer] ||
    layer === userProps['appearance'] ||
    layer === userProps['size'] ||
    (!userProps['size'] && layer === getDefaultSize()) ||
    layer === userProps['shape'] ||
    (!userProps['shape'] && layer === 'rounded') ||
    (layer === 'hasContent' && !userProps.iconOnly) ||
    (layer === 'hasIcon' && (userProps.icon || userProps.loading))
  );
};

const ButtonComposed = compose<ButtonType>({
  displayName: buttonName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
  },
  render: (userProps: ButtonPropsWithInnerRef, useSlots: UseSlots<ButtonType>) => {
    const button = useButton(userProps);
    const iconProps = createIconProps(userProps.icon);
    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => buttonLookup(layer, button.state, userProps));

    // now return the handler for finishing render
    return (final: ButtonPropsWithInnerRef, children: React.ReactNode[]) => {
      const { icon, iconPosition, loading, accessibilityLabel, ...mergedProps } = mergeProps(button.props, final);
      let childText = '';
      if (accessibilityLabel === undefined) {
        React.Children.forEach(children, (child) => {
          if (typeof child === 'string') {
            childText = child; // We only automatically support the one child string.
          }
        });
      }
      const label = accessibilityLabel ?? childText;

      return (
        <Slots.root {...mergedProps} accessibilityLabel={label}>
          {icon && iconPosition === 'before' && <Slots.icon {...iconProps} />}
          {loading && <ActivityIndicator />}
          {React.Children.map(children, (child) =>
            typeof child === 'string' ? <Slots.content key="content">{child}</Slots.content> : child,
          )}
          {icon && iconPosition === 'after' && <Slots.icon {...iconProps} />}
        </Slots.root>
      );
    };
  },
});

export const Button = React.forwardRef<IFocusable, ButtonProps>((props, ref) => <ButtonComposed {...props} innerRef={ref} />);

export default Button;
