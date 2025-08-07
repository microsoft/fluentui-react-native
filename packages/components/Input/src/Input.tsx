/** @jsxImportSource @fluentui-react-native/framework-base */
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import { Text } from '@fluentui-react-native/text';

import { stylingSettings } from './Input.styling';
import type { InputType, InputProps } from './Input.types';
import { input } from './Input.types';

/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the input.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the input
 * @returns Whether the styles that are assigned to the layer should be applied to the input
 */
export const inputLookup = () => null;

export const Input = compose<InputType>({
  displayName: input,
  ...stylingSettings,
  slots: {
    root: ScrollView,
    icon: Icon,
    inputWrapper: View,
    label: Text,
    input: View,
    textInput: TextInput,
    accessoryIconPressable: Pressable,
    accessoryIcon: Icon,
    assistiveText: Text,
    accessoryText: Text,
  },
  useRender: (_userProps: InputProps, _useSlots: UseSlots<InputType>) => {
    return (_final: InputProps) => {
      return null;
    };
  },
});
