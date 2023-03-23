import { usePressableState } from '@fluentui-react-native/interactive-hooks';

import type { InputProps, InputInfo } from './Input.types';

export const useInput = (props: InputProps): InputInfo => {
  const { label, secondaryText, assistiveText, onBlur, onFocus, ...rest } = props;
  const pressable = usePressableState({ onBlur, onFocus });
  return { props: { ...pressable.props, label, secondaryText, assistiveText, ...rest }, state: pressable.state };
};
