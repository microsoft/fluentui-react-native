/** @jsx withSlots */
import * as React from 'react';
import { Image, View } from 'react-native';
import { ToggleButtonProps, toggleButtonName, ToggleButtonType } from './ToggleButton.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './ToggleButton.styling';
import { filterImageProps } from '@fluentui-react-native/adapters';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useButton } from '../useButton';
import { useAsToggle } from '@fluentui-react-native/interactive-hooks';

export const ToggleButton = compose<ToggleButtonType>({
  displayName: toggleButtonName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Image,
    content: Text,
  },
  filters: {
    icon: filterImageProps,
  },
  render: (userProps: ToggleButtonProps, useSlots: UseSlots<ToggleButtonType>) => {
    const { icon, content, defaultChecked, checked, onClick, ...rest } = userProps;

    // Warns defaultChecked and checked being mutually exclusive.
    if (defaultChecked != undefined && checked != undefined) {
      console.warn('defaultChecked and checked are mutually exclusive to one another. Use one or the other.');
    }
    const [checkedValue, toggle] = useAsToggle(defaultChecked, checked, onClick);
    const button = useButton({ onClick: toggle, ...rest });

    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => (layer === 'checked' && checkedValue) || button.state[layer] || userProps[layer]);

    // now return the handler for finishing render
    return (final: ToggleButtonProps, ...children: React.ReactNode[]) => {
      const mergedProps = mergeProps<ToggleButtonProps>(button.props, final);

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

export default ToggleButton;
