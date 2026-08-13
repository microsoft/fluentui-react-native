import { directComponent, phasedComponent } from '@fluentui-react-native/framework-base';

import type { InputProps } from './input.types';
import { renderInput_unstable } from './renderInput';
import { useApplyStyles_unstable } from './useApplyStyles';
import { useInput_unstable } from './useInput';

export const Input = phasedComponent<InputProps>((props) => {
  const state = useInput_unstable(props);
  useApplyStyles_unstable(state);
  return directComponent<InputProps>(() => renderInput_unstable(state));
});

Input.displayName = 'Input';

export default Input;

