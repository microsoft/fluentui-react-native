import * as React from 'react';

import { usePressableState } from '@fluentui-react-native/interactive-hooks';

import type { InputProps, InputInfo } from './Input.types';

export const useInput = (props: InputProps): InputInfo => {
  const { label, secondaryText, assistiveText, onBlur, onFocus, onChange, value, defaultValue, ...rest } = props;
  const pressable = usePressableState({ onBlur, onFocus });
  const [text, setText] = React.useState<string>(defaultValue ? defaultValue : '');
  return {
    props: { ...pressable.props, label, secondaryText, assistiveText, setText, onChange, value, defaultValue, ...rest },
    state: { ...pressable.state, text: value ? value : text },
  };
};
