/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { fabButtonName, FabButtonType } from './FabButton.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './FabButton.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useButton } from '../useButton';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps, IPressableState } from '@fluentui-react-native/interactive-hooks';
import { ButtonCoreProps } from '../Button.types';

/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the button.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the button
 * @param userProps The props that were passed into the button
 * @returns Whether the styles that are assigned to the layer should be applied to the button
 */
const buttonLookup = (layer: string, state: IPressableState, userProps: ButtonCoreProps): boolean => {
  return state[layer] || userProps[layer] || (layer === 'hasContent' && userProps.content) || (layer === 'hasIcon' && userProps.icon);
};

export const FabButton = compose<FabButtonType>({
  displayName: fabButtonName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
  },
  render: (userProps: ButtonCoreProps, useSlots: UseSlots<FabButtonType>) => {
    const { icon, content, onClick, ...rest } = userProps;
    const iconProps = createIconProps(userProps.icon);

    const button = useButton(rest);

    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => buttonLookup(layer, button.state, userProps));

    // now return the handler for finishing render
    return (final: ButtonCoreProps, ...children: React.ReactNode[]) => {
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

export default FabButton;
