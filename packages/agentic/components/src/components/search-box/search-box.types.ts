import type * as React from 'react';
import type { StyleProp, TextInput, View, ViewStyle } from 'react-native';

import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';

import type { Icon } from '../../primitives/icon/icon';
import type { Button } from '../button/button';
import type { InputSize, InputState, InputVariant, InputVisualState } from '../input/input.types';

export type SearchBoxVariant = InputVariant;
export type SearchBoxSize = InputSize;

/** SearchBox never resolves the error state: a query is transient input rather than saved data. */
export type SearchBoxVisualState = Exclude<InputVisualState, 'error'>;

export type SearchBoxSlots = {
  /** The container view that owns the corner radius and the caller style. */
  root: Slot<typeof View>;

  /** The accessible text entry element. It carries the role, the name, and the state. */
  textInput: Slot<typeof TextInput>;

  /** The decorative leading search icon. Rendered by default; pass `null` to remove it. */
  icon: OptionalSlot<typeof Icon>;

  /**
   * The trailing control that empties the query. Rendered only while the query is non-empty;
   * pass `null` to remove it. Its press behavior and disabled resolution are owned by SearchBox.
   */
  clearButton: OptionalSlot<typeof Button>;
};

type SearchBoxStateSlots = SearchBoxSlots & {
  contents: OptionalSlot<typeof View>;
  iconTextStack: OptionalSlot<typeof View>;
  clearButtonGroup: OptionalSlot<typeof View>;
  underline: OptionalSlot<typeof View>;
};

export type SearchBoxStateProps = {
  /** Selects a full boundary or a bottom edge. Defaults to `outline`. */
  variant?: SearchBoxVariant;
  /** Drives the field height, the typography, the icon size, and the clear button metrics. Defaults to `medium`. */
  size?: SearchBoxSize;
  /** Blocks editing and clearing, and dims the query. */
  disabled?: boolean;
  /** Blocks editing and clearing while the query stays at full emphasis. */
  readOnly?: boolean;
  /** The externally driven query. Supplying it makes the component controlled. */
  value?: string;
  /** The starting query while the query is internally driven. */
  defaultValue?: string;
  /** Prompt text shown while the query is empty. It is never the accessible name. */
  placeholder?: string;
  /** Called with the next query on every accepted edit, including the empty string on a clear. */
  onChangeText?: (text: string) => void;
  /** Called with the current query when the platform text input reports an explicit submit. */
  onSearch?: (value: string) => void;
  /** Called after the clear affordance empties the query. */
  onClear?: () => void;
  onBlur?: (...args: any[]) => void;
  onFocus?: (...args: any[]) => void;
  onHoverIn?: (...args: any[]) => void;
  onHoverOut?: (...args: any[]) => void;
  onPressIn?: (...args: any[]) => void;
  onPressOut?: (...args: any[]) => void;
};

export type SearchBoxExposedRootProps = OwnedRootProps<PropsWithRefOf<typeof View>, 'accessibilityRole' | 'role'>;

export type SearchBoxProps = SearchBoxStateProps & ComponentProps<SearchBoxSlots, SearchBoxExposedRootProps>;

export type SearchBoxState = ComponentState<SearchBoxStateSlots> &
  Required<Pick<SearchBoxStateProps, 'variant' | 'size' | 'disabled' | 'readOnly'>> & {
    /** The field state resolved by the Input pipeline. SearchBox delegates every chrome binding to it. */
    field: InputState;
    /** The current query. */
    value: string;
    /** Whether the clear affordance is present. */
    clearVisible: boolean;
    focused: boolean;
    hovered: boolean;
    pressed: boolean;
    visualState: SearchBoxVisualState;
    /** Internal handle used to return focus to the field after a clear. */
    textInputRef: React.RefObject<TextInput | null>;
    /** Style applied to the clear button after its own token-derived styles. */
    clearButtonStyle?: StyleProp<ViewStyle>;
    /** Style applied to the group that holds the clear button. */
    clearButtonGroupStyle: ViewStyle;
    userStyle?: StyleProp<ViewStyle>;
  };
