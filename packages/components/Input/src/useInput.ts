import * as React from 'react';

import { createIconProps } from '@fluentui-react-native/icon';
import type { IconProps } from '@fluentui-react-native/icon';
import { usePressableState } from '@fluentui-react-native/interactive-hooks';

import { DismissSvg } from './assets/dismissSvg';
import type { InputProps, InputInfo } from './Input.types';

export const useInput = (props: InputProps): InputInfo => {
  const defaultComponentRef = React.useRef(null);
  const {
    type,
    label,
    accessoryText,
    assistiveText,
    onBlur,
    onFocus,
    onChange,
    value,
    accessoryIcon = { svgSource: { src: DismissSvg } }, // Default accessory icon
    accessoryButtonOnPress,
    defaultValue,
    textInputProps,
    placeholder,
    defaultIcon,
    focusedStateIcon,
    componentRef = defaultComponentRef,
    accessibilityLabel,
    error,
    ...rest
  } = props;
  const pressable = usePressableState({ onBlur, onFocus });
  const [text, setText] = React.useState<string>(defaultValue ? defaultValue : '');
  const defaultIconProps = createIconProps(defaultIcon);
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
      accessoryText,
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
        accessibilityLabel,
      },
      defaultIcon,
      focusedStateIcon,
      iconProps,
      defaultIconProps,
      focusedIconProps,
      setIconProps,
      error,
      componentRef,
      ...rest,
    },
    state: { ...pressable.state, text: value ? value : text },
  };
};
