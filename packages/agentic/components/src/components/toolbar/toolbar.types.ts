import type * as React from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';
import type {
  ComponentProps,
  ComponentState,
  FocusKeyboardEvent,
  OwnedRootProps,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';
import type { ToolbarContextValue } from './ToolbarContext';

export type ToolbarSize = 'small' | 'large';
export type ToolbarDirection = 'ltr' | 'rtl';
export type ToolbarSlots = { root: Slot<typeof View> };

type OwnedViewKeys =
  | 'accessibilityRole'
  | 'role'
  | 'accessible'
  | 'focusable'
  | 'tabIndex'
  | 'keyDownEvents'
  | 'keyUpEvents'
  | 'validKeysDown'
  | 'validKeysUp'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-hidden'
  | 'accessibilityElementsHidden'
  | 'importantForAccessibility'
  | 'onKeyDown'
  | 'onKeyUp';

export type ToolbarProps = ComponentProps<ToolbarSlots, OwnedRootProps<PropsWithRefOf<typeof View>, OwnedViewKeys>> & {
  /** Direct ToolbarButton/Divider children, optionally in arrays or Fragments. */
  children: React.ReactNode;
  accessibilityLabel: string;
  /** Command size and row gap. @default large */
  size?: ToolbarSize;
  /** Defaults to I18nManager.isRTL. Controls layout and horizontal arrows together. */
  direction?: ToolbarDirection;
  onKeyDown?: (event: FocusKeyboardEvent) => void;
  onKeyUp?: (event: FocusKeyboardEvent) => void;
  as?: React.ComponentType<PropsWithRefOf<typeof View>>;
};

export type ToolbarState = ComponentState<ToolbarSlots> &
  ThemeState & {
    children: React.ReactNode;
    contextValue: ToolbarContextValue;
    direction: ToolbarDirection;
    size: ToolbarSize;
    valid: boolean;
    userStyle?: StyleProp<ViewStyle>;
  };
