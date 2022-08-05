import * as React from 'react';

/**
 * Context shared between RadioGroup and its children Radio components
 */
export interface RadioGroupContextValue {
  /**
   * The currently selected RadioButton's key
   */
  value: string | null;

  /**
   * Updates the selected button and calls the client’s onChange callback
   */
  onChange?: (key: string) => void;

  /**
   * Updates the selected button's ref to set as the default tabbable element
   */
  updateSelectedButtonRef?: (ref: React.RefObject<any>) => void;

  /**
   * Array of radio button keys in the group
   */
  buttonKeys?: string[];
}

export const RadioGroupContext = React.createContext<RadioGroupContextValue>({
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
