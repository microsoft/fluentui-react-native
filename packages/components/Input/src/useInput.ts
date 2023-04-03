import * as React from 'react';

import { usePressableState } from '@fluentui-react-native/interactive-hooks';

import type { InputProps, InputInfo } from './Input.types';

export const useInput = (props: InputProps): InputInfo => {
  const {
    type,
    label,
    secondaryText,
    assistiveText,
    onBlur,
    onFocus,
    onChange,
    accessoryButtonOnPress,
    value,
    defaultValue,
    textInputProps,
    placeholder,
    ...rest
  } = props;
  const pressable = usePressableState({ onBlur, onFocus });
  const [text, setText] = React.useState<string>(defaultValue ? defaultValue : '');
  return {
    props: {
      ...pressable.props,
      label,
      secondaryText,
      assistiveText,
      setText,
      onChange,
      accessoryButtonOnPress,
      value,
      // Directly applied onto the TextInput
      textInputProps: {
        ...textInputProps,
        keyboardType: type,
        placeholder,
        defaultValue,
        value: value ? value : text,
        onChangeText: (text) => {
          !value && setText(text);
          onChange && onChange(text);
        },
      },
      ...rest,
    },
    state: { ...pressable.state, text: value ? value : text },
  };
};
