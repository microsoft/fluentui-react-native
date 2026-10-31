import type * as React from 'react';
import type { ColorValue, Pressable, PressableProps, StyleProp, Text as NativeText, TextStyle, View, ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentState,
  OptionalSlot,
  OptionalSlotProp,
  OwnedRootProps,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';

import type { FocusVisualsSlots } from '../../common/useFocusVisuals';
import type { Icon } from '../../primitives/icon/icon';
import type { InputResolvedStyles } from '../input/input.styles';
import type { InputSize, InputVariant, InputVisualState } from '../input/input.types';
import type { DropdownPopupProps } from './dropdownPopup';

export type DropdownVariant = InputVariant;
export type DropdownSize = InputSize;

/**
 * Why requested presence changed: `trigger` for a trigger press, an opening key, or the expand or collapse action;
 * `dismiss` for Escape, Tab, outside input, and other native dismissals; `select` for a single-mode commit.
 */
export type DropdownOpenChangeReason = 'trigger' | 'dismiss' | 'select';

export interface DropdownOpenChangeData {
  reason: DropdownOpenChangeReason;
}

export interface DropdownSelectionChangeData {
  /** The option whose activation or selection action caused the change. */
  value: string;
}

/** Props for the trigger Pressable. Its values win over the props Dropdown lifts from the root. */
export type DropdownTriggerProps = Omit<PropsWithRefOf<typeof Pressable>, 'children'>;

/**
 * Props for the list surface. It is the native popup's content attachment, so it accepts View props and a ref but
 * cannot be replaced; its ref is null while the list is closed.
 */
export type DropdownListboxProps = Omit<PropsWithRefOf<typeof View>, 'children' | 'collapsable'>;

export type DropdownStateProps = {
  /** Input's outline or underline chrome. Defaults to `outline`. */
  variant?: DropdownVariant;
  /** Input's metrics and typography. Defaults to `medium`. */
  size?: DropdownSize;
  /** Disables the trigger. A disabled Dropdown never presents its list. */
  disabled?: boolean;
  /** Selects Input's danger boundary. */
  error?: boolean;
  /** Selects multiple mode, where activation toggles options and keeps the list open. */
  multiselect?: boolean;
  /** The selected option values. When supplied, the caller owns the selection. */
  selectedOptions?: readonly string[];
  /** The starting selection while Dropdown owns it. Defaults to none. */
  defaultSelectedOptions?: readonly string[];
  /** Reports each change a person caused and the option that caused it. Caller changes are not reported. */
  onSelectedOptionsChange?: (selectedOptions: string[], data: DropdownSelectionChangeData) => void;
  /** Shown when no selected value matches an option. Defaults to `Select an option`. */
  placeholder?: string;
  /** The multiple-mode summary shown when the selected labels do not fit. Defaults to `${count} selected`. */
  formatSelectedCount?: (count: number) => string;
  /** Requested presence of the list. When supplied, the caller owns it; `false` and omission are distinct. */
  open?: boolean;
  /** Starting requested presence while Dropdown owns it. Defaults to false. */
  defaultOpen?: boolean;
  /** Reports presence changes a person caused. Caller-driven `open` changes are not reported. */
  onOpenChange?: (open: boolean, data: DropdownOpenChangeData) => void;
};

/** Pressable handlers Dropdown lifts from the root to the trigger, as Input lifts them to its editor. */
export type DropdownLiftedProps = Pick<PressableProps, 'onHoverIn' | 'onHoverOut' | 'onPressIn' | 'onPressOut'>;

export type DropdownExposedRootProps = OwnedRootProps<PropsWithRefOf<typeof View>>;

export type DropdownProps = DropdownStateProps &
  DropdownLiftedProps &
  DropdownExposedRootProps & {
    /** Optional leading icon. */
    iconStart?: OptionalSlotProp<typeof Icon>;
    /** Props for the trigger Pressable. */
    trigger?: DropdownTriggerProps;
    /** Props for the list surface. Its name defaults to the trigger's string label. */
    listbox?: DropdownListboxProps;
    /** ListboxItem options, each with a unique string `value`, and other list content such as section headers. */
    children: React.ReactNode;
  };

export type DropdownSlots = {
  root: Slot<typeof View>;
  trigger: Slot<typeof Pressable>;
  iconStart: OptionalSlot<typeof Icon>;
};

type DropdownStateSlots = DropdownSlots &
  FocusVisualsSlots & {
    chevron: Slot<typeof Icon>;
    value: Slot<typeof NativeText>;
    underline: OptionalSlot<typeof View>;
    underlineFocus: OptionalSlot<typeof View>;
  };

export type DropdownState = ComponentState<DropdownStateSlots> &
  ThemeState &
  Required<Pick<DropdownStateProps, 'variant' | 'size' | 'disabled' | 'error' | 'multiselect'>> & {
    /** Whether the list is presented. */
    open: boolean;
    visualState: InputVisualState;
    focusVisible: boolean;
    /** Whether the value text shows the placeholder. */
    showsPlaceholder: boolean;
    /** The joined labels a hidden row measures in multiple mode, or undefined. */
    measureText?: string;
    onValueLayout(width: number): void;
    onMeasureLayout(width: number): void;
    triggerRef: React.RefCallback<React.ComponentRef<typeof View>>;
    popupProps: DropdownPopupProps;
    resolved: InputResolvedStyles;
    chevronColor: ColorValue;
    valueStyle?: StyleProp<TextStyle>;
    userStyle?: StyleProp<ViewStyle>;
  };
