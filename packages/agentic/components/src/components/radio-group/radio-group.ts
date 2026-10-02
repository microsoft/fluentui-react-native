import { useRadioGroup_unstable } from './useRadioGroup';
import { useRadioGroupStyles_unstable } from './useRadioGroupStyles';
import { renderRadioGroup_unstable } from './renderRadioGroup';
import type { RadioGroupProps } from './radio-group.types';

export function RadioGroup(props: RadioGroupProps) {
  const state = useRadioGroup_unstable(props);
  useRadioGroupStyles_unstable(state);
  return renderRadioGroup_unstable(state);
}
RadioGroup.displayName = 'RadioGroup';
