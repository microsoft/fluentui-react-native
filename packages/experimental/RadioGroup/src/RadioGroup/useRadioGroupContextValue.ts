import type { RadioGroupContextValue } from './radioGroupContext';
import type { RadioGroupState } from './RadioGroup.types';

export const useRadioGroupContextValue = (state: RadioGroupState): RadioGroupContextValue => {
  return { ...state };
};
