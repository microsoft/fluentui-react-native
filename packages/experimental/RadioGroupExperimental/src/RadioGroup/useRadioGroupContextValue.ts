import { RadioGroupContextValue } from './radioGroupContext';
import { RadioGroupState } from './RadioGroup.types';
import { slotPropsFromSettings } from '@uifabricshared/foundation-settings';

export const useRadioGroupContextValue = (state: RadioGroupState): RadioGroupContextValue => {
  return { ...state };
};
