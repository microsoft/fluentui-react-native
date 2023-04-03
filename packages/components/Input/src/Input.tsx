/** @jsx withSlots */
import { Fragment } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { createIconProps } from '@fluentui-react-native/icon';
import { Icon } from '@fluentui-react-native/icon';
import type { FocusState } from '@fluentui-react-native/interactive-hooks/lib/usePressableState.types';
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
export const inputLookup = (layer: string, state: FocusState & { text: string }, userProps: InputProps): boolean => {
  return (
    (layer === 'focused' && state.focused && !state.text) ||
    (layer === 'filled' && !state.focused && !!state.text) ||
    (layer === 'typing' && state.focused && !!state.text) ||
    userProps[layer] ||
    (layer === 'hasIcon' && userProps.icon) ||
    (layer === 'error' && !!userProps.error)
  );
};

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
    secondaryText: Text,
  },
  useRender: (userProps: InputProps, useSlots: UseSlots<InputType>) => {
    const input = useInput(userProps);
    const iconProps = createIconProps(userProps.icon);
    const accessoryIconProps = createIconProps(userProps.accessoryIcon);
    const Slots = useSlots(userProps, (layer) => inputLookup(layer, input.state, userProps));

    return (final: InputProps) => {
      const {
        label,
        secondaryText,
        assistiveText,
        icon,
        accessoryIcon,
        textInputProps,
        error,
        accessoryButtonOnPress,
        keyboardShouldPersistTaps,
        onChange, // Remove out of mergedProps
        ...mergedProps
      } = mergeProps(input.props, final);
      const IconWrapper = icon ? Slots.inputWrapper : Fragment;

      return (
        <Slots.root {...mergedProps} keyboardShouldPersistTaps={keyboardShouldPersistTaps ? keyboardShouldPersistTaps : 'handled'}>
          {label && <Slots.label>{label}</Slots.label>}
          <IconWrapper>
            {icon && <Slots.icon {...iconProps} accessible={false} />}
            <Slots.input>
              <Slots.textInput {...textInputProps} />
              {secondaryText && <Slots.secondaryText>{secondaryText}</Slots.secondaryText>}
              {accessoryIcon && (
                <Slots.accessoryIconPressable
                  accessibilityRole="button"
                  onTouchStart={(e) => (accessoryButtonOnPress ? accessoryButtonOnPress(e) : input.props.setText(''))}
                >
                  <Slots.accessoryIcon {...accessoryIconProps} accessible={false} />
                </Slots.accessoryIconPressable>
              )}
            </Slots.input>
          </IconWrapper>
          {assistiveText && <Slots.assistiveText>{error ? error : assistiveText}</Slots.assistiveText>}
        </Slots.root>
      );
    };
  },
});
