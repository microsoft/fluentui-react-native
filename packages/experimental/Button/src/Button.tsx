/** @jsx withSlots */
import * as React from 'react';
import { Image, View, ViewProps } from 'react-native';
import { ButtonProps, buttonName, ButtonType } from './Button.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './Button.styling';
import { filterViewProps, filterImageProps } from '@fluentui-react-native/adapters';
import { useAsPressable, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';

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
    const {
      icon,
      content,
      onAccessibilityTap = userProps.onClick,
      accessibilityLabel = userProps.content,
      onClick,
      testID,
      ...rest
    } = userProps;

    // attach the pressable state handlers
    const pressable = useAsPressable({ ...rest, onPress: onClick });
    const onKeyUp = React.useCallback(
      e => {
        if (onClick && (e.nativeEvent.key === 'Enter' || e.nativeEvent.key === ' ')) {
          onClick();
          e.stopPropagation();
        }
      },
      [onClick],
    );

    const buttonRef = useViewCommandFocus(userProps.componentRef);
    // grab the styled slots
    const Slots = useSlots(userProps, layer => pressable.state[layer] || userProps[layer]);

    // now return the handler for finishing render
    return (final: ButtonProps, ...children: React.ReactNode[]) => {
      const mergedProps = mergeProps(
        {
          ref: buttonRef,
          accessible: true,
          acceptsKeyboardFocus: true,
          accessibilityRole: 'button',
          onAccessibilityTap,
          accessibilityLabel,
          onKeyUp,
        } as ViewProps,
        pressable.props,
        final,
      );

      return (
        <Slots.root {...mergedProps}>
          <Slots.stack>
            {icon && <Slots.icon key="icon" source={{ uri: icon }} />}
            {content && (
              <Slots.content key="content" testID={testID}>
                {content}
              </Slots.content>
            )}
            {children}
          </Slots.stack>
        </Slots.root>
      );
    };
  },
});

export default Button;
