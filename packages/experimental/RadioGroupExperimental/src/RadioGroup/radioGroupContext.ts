import * as React from 'react';
import { RadioGroupState } from './RadioGroup.types';

/**
 * Context shared between RadioGroup and its children Radio components
 */
export interface RadioGroupContextValue extends Omit<RadioGroupState, 'props'> {
  // isChecked: boolean;
}

export const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  // isChecked: false,
  value: null,
  onChange: (/* key: string */) => {
    return;
  },
  updateSelectedButtonRef: (/* ref: React.RefObject<any>*/) => {
    return;
  },
  buttonKeys: [],
});

export const RadioGroupProvider = RadioGroupContext.Provider;
export const useRadioGroupContext = () => React.useContext(RadioGroupContext);
