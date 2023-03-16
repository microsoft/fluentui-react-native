import type { RadioGroupState } from './RadioGroup.types';
import type { RadioGroupContextValue } from './radioGroupContext';

export const useRadioGroupContextValue = (state: RadioGroupState): RadioGroupContextValue => {
  return { ...state };
};
