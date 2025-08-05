/** @jsxImportSource @fluentui-react-native/framework-base */
import { Platform, Pressable, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import type { PressableState } from '@fluentui-react-native/interactive-hooks';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stylingSettings } from './Radio.styling';
import type { RadioType, RadioProps } from './Radio.types';
import { radioName } from './Radio.types';
import { useRadio } from './useRadio';

/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the Radio.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the Radio
 * @param userProps The props that were passed into the Radio
 * @returns Whether the styles that are assigned to the layer should be applied to the Radio
 */
export const radioLookup = (layer: string, state: PressableState, userProps: RadioProps): boolean => {
  return (
    state[layer] ||
    userProps[layer] ||
    (!(Platform.OS === ('win32' as any) || Platform.OS === 'android') &&
      layer === 'labelPositionBelow' &&
      userProps['labelPosition'] === 'below')
  );
};

export const Radio = compose<RadioType>({
  displayName: radioName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    button: Pressable,
    innerCircle: View,
    labelContent: View,
    label: Text,
    subtext: Text,
  },
  useRender: (userProps: RadioProps, useSlots: UseSlots<RadioType>) => {
    const radio = useRadio(userProps);
    const Slots = useSlots(userProps, (layer: string) => radioLookup(layer, radio.state, radio.props));

    // now return the handler for finishing render
    return (final: RadioProps) => {
      const { label, subtext, ...mergedProps } = mergeProps(radio.props, final);
      const { onPress, disabled, onPressIn, onPressOut } = mergedProps;
      const isMobile = Platform.OS === 'android' || Platform.OS === 'ios';

      const labelComponent = (
        <Slots.labelContent>
          <Slots.label>{label}</Slots.label>
          {!!subtext && <Slots.subtext>{subtext}</Slots.subtext>}
        </Slots.labelContent>
      );

      return (
        <Slots.root {...mergedProps} {...(isMobile && { accessible: !disabled, focusable: !disabled })}>
          <Slots.button
            accessible={false}
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={disabled}
            focusable={false}
          >
            <Slots.innerCircle />
          </Slots.button>
          {labelComponent}
        </Slots.root>
      );
    };
  },
});
