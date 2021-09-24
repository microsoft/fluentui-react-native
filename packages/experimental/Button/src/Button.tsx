/** @jsx withSlots */
import * as React from 'react';
import { Platform, View } from 'react-native';
import { buttonName, ButtonType, ButtonProps, ButtonSize } from './Button.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './Button.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useButton } from './useButton';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps } from '@fluentui-react-native/interactive-hooks';

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
    const Slots = useSlots(
      userProps,
      layer =>
        button.state[layer] ||
        userProps[layer] ||
        layer === userProps['size'] ||
        (!userProps.fab && layer === getDefaultSize()) ||
        (layer === 'hasContent' && userProps.content) ||
        (layer === 'hasIcon' && userProps.icon),
    );

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

function getDefaultSize(): ButtonSize {
  if (Platform.OS === 'windows') {
    return 'medium';
  } else if ((Platform.OS as any) === 'win32') {
    return 'small';
  }

  return 'medium';
}

export default Button;
