/** @jsx withSlots */
import { TextInput, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import type { IconSourcesType, SvgIconProps } from '@fluentui-react-native/icon';
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

const svgUriProps: SvgIconProps = {
  uri: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg',
  viewBox: '0 0 1000 1000',
};
const iconProps: IconSourcesType = { svgSource: { ...svgUriProps }, color: 'red' };

export const Input = compose<InputType>({
  displayName: input,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    contentContainer: View,
    label: Text,
    input: TextInput,
    inputWrapper: View,
    dismissIcon: Icon,
    assistiveText: Text,
    secondaryText: Text,
  },
  useRender: (userProps: InputProps, useSlots: UseSlots<InputType>) => {
    const inputProps = useInput(userProps);
    const Slots = useSlots(userProps, (layer) => inputLookup(layer, userProps));

    return (final: InputProps) => {
      const { label, secondaryText, assistiveText, ...mergedProps } = mergeProps(inputProps, final);

      return (
        <Slots.root {...mergedProps}>
          <Slots.icon {...iconProps} />
          <Slots.contentContainer>
            <Slots.label>{label}</Slots.label>
            <Slots.inputWrapper>
              <Slots.input placeholder="Input Text" multiline={true} />
              <Slots.secondaryText>{secondaryText}</Slots.secondaryText>
              <Slots.dismissIcon {...iconProps} />
            </Slots.inputWrapper>
            <Slots.assistiveText>{assistiveText}</Slots.assistiveText>
          </Slots.contentContainer>
        </Slots.root>
      );
    };
  },
});
