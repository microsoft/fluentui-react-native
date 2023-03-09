/** @jsx withSlots */
import { TextInput, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import { Text } from '@fluentui-react-native/text';

import { stylingSettings } from './Input.styling';
import type { InputType, InputProps } from './Input.types';
import { input } from './Input.types';
import { useInput } from './useInput';

/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the input.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the input
 * @returns Whether the styles that are assigned to the layer should be applied to the input
 */
export const inputLookup = (layer: string, userProps: InputProps): boolean => {
  return userProps[layer] || layer === userProps['textSize'];
};

const fontBuiltInProps = {
  fontFamily: 'Arial',
  codepoint: 0x2663,
  fontSize: 16,
};
const iconProps = { fontSource: { ...fontBuiltInProps }, color: '#fff' };

export const Input = compose<InputType>({
  displayName: input,
  ...stylingSettings,
  slots: {
    root: View,
    label: Text,
    input: TextInput,
    inputWrapper: View,
    icon: Icon,
    dismissIcon: Icon,
    assistiveText: Text,
    secondaryText: Text,
  },
  useRender: (userProps: InputProps, useSlots: UseSlots<InputType>) => {
    const inputProps = useInput(userProps);
    const Slots = useSlots(userProps, (layer) => inputLookup(layer, userProps));

    return (final: InputProps) => {
      const { text, ...mergedProps } = mergeProps(inputProps, final);

      return (
        <Slots.root {...mergedProps}>
          <Slots.icon {...iconProps} />
          <Slots.label>Label</Slots.label>
          <Slots.inputWrapper>
            <Slots.input />
            <Slots.secondaryText>Secondary</Slots.secondaryText>
            <Slots.dismissIcon {...iconProps} />
          </Slots.inputWrapper>
          <Slots.assistiveText>Assistive Text</Slots.assistiveText>
        </Slots.root>
      );
    };
  },
});
