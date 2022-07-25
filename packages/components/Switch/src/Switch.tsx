/** @jsx withSlots */
import * as React from 'react';
import { View, Text } from 'react-native';
import { buttonName, SwitchType, ButtonProps } from './Switch.types';
// import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './Switch.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useSwitch } from './useSwitch';
import { IPressableState } from '@fluentui-react-native/interactive-hooks';
// import { ViewWin32 } from '@office-iss/react-native-win32';
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
    (!userProps['size'] && layer === 'small') ||
    layer === userProps['shape'] ||
    (!userProps['shape'] && layer === 'rounded') ||
    (layer === 'hovered' && state[layer] && !userProps.loading) ||
    (layer === 'hasContent' && !userProps.iconOnly) ||
    (layer === 'hasIconAfter' && (userProps.icon || userProps.loading) && userProps.iconPosition === 'after') ||
    (layer === 'hasIconBefore' && (userProps.icon || userProps.loading) && (!userProps.iconPosition || userProps.iconPosition === 'before'))
  );
};

export const Switch = compose<SwitchType>({
  displayName: buttonName,
  ...stylingSettings,
  slots: {
    root: View,
    label: Text,
    track: View,
    thumb: View,
  },
  useRender: (userProps: ButtonProps, useSlots: UseSlots<SwitchType>) => {
    const button = useSwitch(userProps);
    // grab the styled slots
    const Slots = useSlots(userProps, (layer) => buttonLookup(layer, button.state, userProps));

    // now return the handler for finishing render
    return (final: ButtonProps, ...children: React.ReactNode[]) => {
      const { icon, iconOnly, iconPosition, loading, accessibilityLabel, ...mergedProps } = mergeProps(button.props, final);

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
          <Slots.label>Label</Slots.label>
          <Slots.track>
            <Slots.thumb
              style={[!button.state.checked ? { left: 0} : { left: 20}]}
            />
          </Slots.track>
        </Slots.root>
      );
    };
  },
});
