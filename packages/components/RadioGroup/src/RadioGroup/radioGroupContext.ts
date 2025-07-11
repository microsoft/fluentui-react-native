import * as React from 'react';

import type { RadioGroupState } from './RadioGroup.types';

/**
 * Context shared between RadioGroup and its children Radio components
 */
export type RadioGroupContextValue = RadioGroupState;

export const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  value: null,
  disabled: false,
  layout: 'vertical',
  onChange: (/* key: string */) => {
    return;
  },
  updateSelectedButtonRef: (/* ref: React.RefObject<any>*/) => {
    return;
  },
  values: [],
  enabledValues: [],
  invoked: false,
  addRadioValue: (/* value: string */) => false,
  removeRadioValue: (/* value: string */) => false,
  addRadioEnabledValue: (/* value: string  */) => false,
  removeRadioEnabledValue: (/* value: string */) => false,
});

export const RadioGroupProvider = RadioGroupContext.Provider;
export const useRadioGroupContext = () => React.useContext(RadioGroupContext);
