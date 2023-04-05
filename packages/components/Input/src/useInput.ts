import * as React from 'react';

import { usePressableState } from '@fluentui-react-native/interactive-hooks';

import DismissSvg from './assets/dismissIcon.svg'; // Default accessory icon
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
    value,
    accessoryIcon = value ? undefined : { svgSource: { src: DismissSvg, viewBox: '0 0 20 20' } },
    accessoryButtonOnPress,
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
      accessoryIcon,
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
