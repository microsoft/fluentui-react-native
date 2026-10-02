import * as React from 'react';
import type { FocusIntent, FocusKeyboardEvent, FocusTarget } from '@fluentui-react-native/framework-base';

export type RadioGroupContextValue = {
  activeValue: string | undefined;
  focusedValue: string | undefined;
  selectedValue: string | null;
  disabled: boolean;
  getPosition(value: string): number;
  setSize: number;
  isEligible(value: string): boolean;
  registerItem(value: string, target: FocusTarget): () => void;
  onItemFocus(value: string): void;
  onItemBlur(value: string): void;
  onItemKeyDown(value: string, event: FocusKeyboardEvent): void;
  onItemSelect(value: string, intent?: FocusIntent): void;
};

export const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined);
