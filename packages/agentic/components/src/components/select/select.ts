import { renderSelect_unstable } from './renderSelect';
import type { SelectProps } from './select.types';
import { useSelect_unstable } from './useSelect';
import { useSelectStyles_unstable } from './useSelectStyles';

export const Select = (props: SelectProps) => {
  const state = useSelect_unstable(props);
  useSelectStyles_unstable(state);
  return renderSelect_unstable(state);
};
Select.displayName = 'Select';
