/** @jsxImportSource @fluentui-react-native/framework-base */
import { Fragment } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { createIconProps } from '@fluentui-react-native/icon';
import { Icon } from '@fluentui-react-native/icon';
import type { FocusState } from '@fluentui-react-native/interactive-hooks';
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
    (layer === 'hasIcon' && userProps.defaultIcon) ||
    (layer === 'error' && !!userProps.error && !!state.text)
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
    accessoryText: Text,
  },
  useRender: (userProps: InputProps, useSlots: UseSlots<InputType>) => {
    const input = useInput(userProps);
    const accessoryIconProps = createIconProps(input.props.accessoryIcon);
    const Slots = useSlots(userProps, (layer) => inputLookup(layer, input.state, userProps));

    return (final: InputProps) => {
      const {
        label,
        accessoryText,
        assistiveText,
        defaultIcon,
        accessoryIcon,
        textInputProps,
        error,
        accessoryButtonOnPress,
        keyboardShouldPersistTaps,
        iconProps,
        componentRef,
        accessoryIconAccessibilityLabel,
        onChange, // Remove out of mergedProps
        ...mergedProps
      } = mergeProps(input.props, final);
      const IconWrapper = defaultIcon ? Slots.inputWrapper : Fragment;

      return (
        <Slots.root {...mergedProps} keyboardShouldPersistTaps={keyboardShouldPersistTaps ? keyboardShouldPersistTaps : 'handled'}>
          {label && <Slots.label>{label}</Slots.label>}
          <IconWrapper>
            {defaultIcon && <Slots.icon {...iconProps} accessible={false} />}
            <Slots.input>
              <Slots.textInput {...textInputProps} />
              {accessoryText && !!input.state.text && <Slots.accessoryText>{accessoryText}</Slots.accessoryText>}
              {accessoryIcon && !!input.state.text && (
                <Slots.accessoryIconPressable
                  accessibilityRole="button"
                  accessibilityLabel={accessoryIconAccessibilityLabel}
                  onPress={(e) => {
                    if (accessoryButtonOnPress) accessoryButtonOnPress(e);
                    else {
                      if (input.props.textInputProps.editable === false) return;
                      input.props.setText('');
                      onChange && onChange('');
                      componentRef.current.focus();
                    }
                  }}
                >
                  <Slots.accessoryIcon {...accessoryIconProps} accessible={false} />
                </Slots.accessoryIconPressable>
              )}
            </Slots.input>
          </IconWrapper>
          {(assistiveText || error != undefined) && <Slots.assistiveText>{error ? error : assistiveText}</Slots.assistiveText>}
        </Slots.root>
      );
    };
  },
});
