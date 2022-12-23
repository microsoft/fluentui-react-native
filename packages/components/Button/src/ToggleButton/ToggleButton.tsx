/** @jsx withSlots */
import * as React from 'react';
import { Pressable } from 'react-native';
import { ActivityIndicator } from '@fluentui-react-native/experimental-activity-indicator';
import { ToggleButtonProps, toggleButtonName, ToggleButtonType } from './ToggleButton.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { stylingSettings } from './ToggleButton.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import { buttonLookup } from '../Button';
import { useToggleButton } from './useToggleButton';

export const ToggleButton = compose<ToggleButtonType>({
  displayName: toggleButtonName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    icon: Icon,
    content: Text,
  },
  useRender: (userProps: ToggleButtonProps, useSlots: UseSlots<ToggleButtonType>) => {
    const iconProps = createIconProps(userProps.icon);
    const toggleButton = useToggleButton(userProps);

    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => buttonLookup(layer, toggleButton.state, userProps));

    // now return the handler for finishing render
    return (final: ToggleButtonProps, ...children: React.ReactNode[]) => {
      const { icon, iconPosition, iconOnly, loading, accessibilityLabel, ...mergedProps } = mergeProps(toggleButton.props, final);
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
