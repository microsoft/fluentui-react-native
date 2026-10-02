import * as React from 'react';
import type { FocusKeyboardEvent, FocusTarget } from '@fluentui-react-native/framework-base';
import type { ToolbarSize } from './toolbar.types';

export type ToolbarContextValue = {
  activeValue: string | undefined;
  size: ToolbarSize;
  isEligible(value: string): boolean;
  register(value: string, target: FocusTarget): () => void;
  onFocus(value: string): void;
  onBlur(value: string): void;
  onKeyDown(value: string, event: FocusKeyboardEvent): void;
  onPress(value: string): void;
};

export const ToolbarContext = React.createContext<ToolbarContextValue | undefined>(undefined);
