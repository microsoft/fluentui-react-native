import type { CheckboxProps } from './checkbox.types';
import { useCheckbox_unstable } from './useCheckbox';
import { useApplyStyles_unstable } from './useApplyStyles';
import { renderCheckbox_unstable } from './renderCheckbox';

export const Checkbox = (props: CheckboxProps) => {
  const state = useCheckbox_unstable(props);
  useApplyStyles_unstable(state);
  return renderCheckbox_unstable(state);
};

Checkbox.displayName = 'Checkbox';

export default Checkbox;

