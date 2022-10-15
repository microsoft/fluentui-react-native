import * as React from 'react';
import { RadioGroupState } from './RadioGroup.types';

/**
 * Context shared between RadioGroup and its children Radio components
 */
export interface RadioGroupContextValue extends RadioGroupState {}

export const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  value: null,
  disabled: false,
  onChange: (/* key: string */) => {
    return;
  },
  updateSelectedButtonRef: (/* ref: React.RefObject<any>*/) => {
    return;
  },
  values: [],
});

export const RadioGroupProvider = RadioGroupContext.Provider;
export const useRadioGroupContext = () => React.useContext(RadioGroupContext);
