import { useRadioStyles_unstable } from '../radio/useRadioStyles';
import type { RadioGroupItemState } from './radio-group-item.types';

export function useRadioGroupItemStyles_unstable(state: RadioGroupItemState) {
  useRadioStyles_unstable(state);
}
