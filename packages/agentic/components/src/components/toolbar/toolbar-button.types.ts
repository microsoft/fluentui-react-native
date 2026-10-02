import type * as React from 'react';
import type { Pressable, StyleProp, ViewStyle } from 'react-native';
import type { FocusKeyboardEvent, PropsWithRefOf } from '@fluentui-react-native/framework-base';
import type { ButtonProps, ButtonSlots, ButtonState } from '../button/button.types';

export type ToolbarButtonSlots = Pick<ButtonSlots, 'root' | 'icon' | 'selectedIcon'>;

type OwnedButtonKeys =
  | 'appearance'
  | 'size'
  | 'shape'
  | 'content'
  | 'iconPosition'
  | 'children'
  | 'focusable'
  | 'tabIndex'
  | 'role'
  | 'accessibilityRole'
  | 'accessible'
  | 'keyDownEvents'
  | 'keyUpEvents'
  | 'validKeysDown'
  | 'validKeysUp'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-hidden'
  | 'aria-disabled'
  | 'aria-checked'
  | 'accessibilityElementsHidden'
  | 'importantForAccessibility'
  | 'accessibilityState'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'style'
  | 'icon';

export type ToolbarButtonProps = Omit<ButtonProps, OwnedButtonKeys> & {
  /** Unique, stable identity within the nearest Toolbar. */
  value: string;
  accessibilityLabel: string;
  icon: NonNullable<ButtonProps['icon']>;
  accessibilityState?: Omit<NonNullable<ButtonProps['accessibilityState']>, 'disabled' | 'checked'>;
  style?: StyleProp<ViewStyle>;
  onKeyDown?: (event: FocusKeyboardEvent) => void;
  onKeyUp?: (event: FocusKeyboardEvent) => void;
  as?: React.ComponentType<PropsWithRefOf<typeof Pressable>>;
};

export type ToolbarButtonState = ButtonState & { valid: boolean; value: string };
