/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { ActivityIndicator } from '@fluentui-react-native/experimental-activity-indicator';
import { buttonName, ButtonType, ButtonProps } from './Button.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings, getDefaultSize } from './Button.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useButton } from './useButton';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps, IPressableState } from '@fluentui-react-native/interactive-hooks';
import { Shadow } from '@fluentui-react-native/experimental-shadow';

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
    layer === userProps['appearance'] ||
    layer === userProps['size'] ||
    (!userProps['size'] && layer === getDefaultSize()) ||
    layer === userProps['shape'] ||
    (!userProps['shape'] && layer === 'rounded') ||
    (layer === 'hovered' && state[layer] && !userProps.loading) ||
    (layer === 'hasContent' && !userProps.iconOnly) ||
    (layer === 'hasIconAfter' && (userProps.icon || userProps.loading) && userProps.iconPosition === 'after') ||
    (layer === 'hasIconBefore' && (userProps.icon || userProps.loading) && (!userProps.iconPosition || userProps.iconPosition === 'before'))
  );
};

export const Button = compose<ButtonType>({
  displayName: buttonName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
    shadow: Shadow,
  },
  useRender: (userProps: ButtonProps, useSlots: UseSlots<ButtonType>) => {
    const button = useButton(userProps);
    const iconProps = createIconProps(userProps.icon);
    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => buttonLookup(layer, button.state, userProps));

    // now return the handler for finishing render
    return (final: ButtonProps, ...children: React.ReactNode[]) => {
      const { icon, iconOnly, iconPosition, loading, accessibilityLabel, ...mergedProps } = mergeProps(button.props, final);

      const shouldShowIcon = !loading && icon;
      if (__DEV__ && iconOnly) {
        React.Children.forEach(children, (child) => {
          if (typeof child === 'string') {
            console.warn('iconOnly should not be set when Button has content.');
          }
        });
      }

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
          {loading && <ActivityIndicator />}
          {shouldShowIcon && iconPosition === 'before' && <Slots.icon {...iconProps} />}
          {React.Children.map(children, (child) =>
            typeof child === 'string' ? <Slots.content key="content">{child}</Slots.content> : child,
          )}
          {shouldShowIcon && iconPosition === 'after' && <Slots.icon {...iconProps} />}
        </Slots.root>
      );
    };
  },
});
