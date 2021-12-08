/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { ToggleButtonComposedProps, ToggleButtonProps, toggleButtonName, ToggleButtonType } from './ToggleButton.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './ToggleButton.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useButton } from '../useButton';
import { IFocusable, useAsToggle } from '@fluentui-react-native/interactive-hooks';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps } from '@fluentui-react-native/interactive-hooks';
import { buttonLookup } from '../Button';

const ToggleButtonComposed = compose<ToggleButtonType>({
  displayName: toggleButtonName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
  },
  render: (userProps: ToggleButtonComposedProps, useSlots: UseSlots<ToggleButtonType>) => {
    const { icon, content, defaultChecked, checked, onClick, ...rest } = userProps;
    const iconProps = createIconProps(userProps.icon);

    // Warns defaultChecked and checked being mutually exclusive.
    if (defaultChecked != undefined && checked != undefined) {
      console.warn('defaultChecked and checked are mutually exclusive to one another. Use one or the other.');
    }
    const [checkedValue, toggle] = useAsToggle(defaultChecked, checked, onClick);
    const button = useButton({ onClick: toggle, ...rest });

    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => (layer === 'checked' && checkedValue) || buttonLookup(layer, button.state, userProps));

    // now return the handler for finishing render
    return (final: ToggleButtonComposedProps, ...children: React.ReactNode[]) => {
      const mergedProps = mergeProps(button.props, final);

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

export const ToggleButton = React.forwardRef<IFocusable, ToggleButtonProps>((props, ref) => (
  <ToggleButtonComposed {...props} innerRef={ref} />
));

export default ToggleButton;
