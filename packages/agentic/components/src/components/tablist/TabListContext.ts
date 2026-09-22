import * as React from 'react';
import type { FocusTarget } from '@fluentui-react-native/framework-base';

import type { TabKeyEvent, TabListOrientation } from './tablist.types';

export type TabListContextValue = {
  activeValue: string | undefined;
  focusedValue: string | undefined;
  disabled: boolean;
  getPosition: (value: string) => number | undefined;
  isTabDisabled: (value: string, disabled: boolean) => boolean;
  onTabFocus: (value: string) => void;
  onTabBlur: (value: string) => void;
  onTabKeyDown: (value: string, event: TabKeyEvent) => void;
  onTabPress: (value: string) => void;
  orientation: TabListOrientation;
  registerTab: (value: string, target: FocusTarget) => () => void;
  selectedValue: string | undefined;
  setSize: number;
};

export const TabListContext = React.createContext<TabListContextValue | undefined>(undefined);
