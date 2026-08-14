import type { CheckboxProps } from './checkbox.types';
import { useCheckbox_unstable } from './useCheckbox';
import { useCheckboxStyles_unstable } from './useCheckboxStyles';
import { renderCheckbox_unstable } from './renderCheckbox';

export const Checkbox = (props: CheckboxProps) => {
  const state = useCheckbox_unstable(props);
  useCheckboxStyles_unstable(state);
  return renderCheckbox_unstable(state);
};

Checkbox.displayName = 'Checkbox';

export default Checkbox;
