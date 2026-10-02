import { useRadioGroupItem_unstable } from './useRadioGroupItem';
import { useRadioGroupItemStyles_unstable } from './useRadioGroupItemStyles';
import { renderRadioGroupItem_unstable } from './renderRadioGroupItem';
import type { RadioGroupItemProps } from './radio-group-item.types';

export function RadioGroupItem(props: RadioGroupItemProps) {
  const state = useRadioGroupItem_unstable(props);
  useRadioGroupItemStyles_unstable(state);
  return renderRadioGroupItem_unstable(state);
}
RadioGroupItem.displayName = 'RadioGroupItem';
