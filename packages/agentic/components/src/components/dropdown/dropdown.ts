import { renderDropdown_unstable } from './renderDropdown';
import type { DropdownProps } from './dropdown.types';
import { useDropdown_unstable } from './useDropdown';
import { useDropdownStyles_unstable } from './useDropdownStyles';

/**
 * A combobox trigger with Input's chrome that presents a native list of ListboxItem options for single or multiple
 * selection.
 */
export const Dropdown = (props: DropdownProps) => {
  const state = useDropdown_unstable(props);
  useDropdownStyles_unstable(state);
  return renderDropdown_unstable(state);
};
Dropdown.displayName = 'Dropdown';

export default Dropdown;
