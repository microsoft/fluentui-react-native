import * as React from 'react';

import { createIconProps } from '@fluentui-react-native/icon';
import type { IconProps } from '@fluentui-react-native/icon';
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
    icon,
    focusedStateIcon,
    componentRef,
    error,
    ...rest
  } = props;
  const pressable = usePressableState({ onBlur, onFocus });
  const [text, setText] = React.useState<string>(defaultValue ? defaultValue : '');
  const defaultIconProps = createIconProps(icon);
  const focusedIconProps = createIconProps(focusedStateIcon);
  const [iconProps, setIconProps] = React.useState<IconProps>(defaultIconProps);
  React.useEffect(() => {
    if (pressable.state.focused && !error && focusedIconProps) {
      setIconProps(focusedIconProps);
    } else {
      setIconProps(defaultIconProps);
    }
  }, [error, pressable.state.focused, defaultIconProps, focusedIconProps]);

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
        ref: componentRef,
      },
      icon,
      focusedStateIcon,
      iconProps,
      defaultIconProps,
      focusedIconProps,
      setIconProps,
      error,
      ...rest,
    },
    state: { ...pressable.state, text: value ? value : text },
  };
};
