/** @jsxImportSource @fluentui-react-native/framework-base */
import { Platform, Pressable, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import type { PressableState } from '@fluentui-react-native/interactive-hooks';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { Svg, Path } from 'react-native-svg';

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
    checkmark: Svg,
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

      const labelComponent = (
        <Slots.labelContent>
          <Slots.label>{label}</Slots.label>
          {!!subtext && <Slots.subtext>{subtext}</Slots.subtext>}
        </Slots.labelContent>
      );

      const checkmarkPath = (
        <Path
          fill="currentColor"
          d="M9.76497 3.20474C10.0661 3.48915 10.0797 3.96383 9.79526 4.26497L5.54526 8.76497C5.40613 8.91228 5.21332 8.99703 5.01071 8.99993C4.8081 9.00282 4.61295 8.92361 4.46967 8.78033L2.21967 6.53033C1.92678 6.23744 1.92678 5.76257 2.21967 5.46967C2.51256 5.17678 2.98744 5.17678 3.28033 5.46967L4.98463 7.17397L8.70474 3.23503C8.98915 2.9339 9.46383 2.92033 9.76497 3.20474Z"
        />
      );

      return (
        <Slots.root {...mergedProps} {...{ accessible: !disabled, focusable: !disabled }}>
          <Slots.button
            accessible={false}
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={disabled}
            focusable={false}
          >
            {(() => {
              const checkmarkProps: any = { key: 'checkmark', viewBox: '0 0 12 12' };
              return <Slots.checkmark {...checkmarkProps}>{checkmarkPath}</Slots.checkmark>;
            })()}
          </Slots.button>
          {labelComponent}
        </Slots.root>
      );
    };
  },
});
