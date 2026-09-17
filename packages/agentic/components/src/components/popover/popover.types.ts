import type * as React from 'react';
import type { AccessibilityState, Pressable, StyleProp, View, ViewStyle } from 'react-native';

import type { Callout, DirectionalHint } from '@fluentui-react-native/callout';
import type { ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentProps,
  ComponentState,
  DistributiveOmit,
  OptionalSlot,
  OwnedRootProps,
  PressableState,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';

import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';

/**
 * Preferred placement of the floating surface relative to its trigger. The native surface owns the final position, and
 * macOS resolves every alignment variant on a side to the same screen edge.
 */
export type PopoverPosition = DirectionalHint;

/**
 * Trigger properties owned by Popover. A consumer cannot supply them because the component cannot honor both its own
 * contract and a conflicting value.
 */
type OwnedTriggerProps = 'accessibilityRole' | 'accessibilityState' | 'accessible' | 'aria-expanded' | 'disabled' | 'focusable' | 'role';

/**
 * The presentation surface of the trigger. `onPress` is allowed and runs after the component's own toggle, and `ref` is
 * allowed and is composed with the internal anchor ref.
 */
export type PopoverTriggerProps = DistributiveOmit<PropsWithRefOf<typeof Pressable>, OwnedTriggerProps>;

export type PopoverSlots = {
  /**
   * The inline wrapper that hosts the trigger and the anchored surface.
   */
  root: Slot<typeof View>;

  /**
   * The control that opens and closes the popover and anchors the floating surface.
   */
  trigger: Slot<typeof Pressable>;

  /**
   * The consumer content rendered inside the floating surface. Pass `null` to render an empty surface.
   */
  content: OptionalSlot<typeof View>;
};

export type PopoverStateSlots = PopoverSlots & {
  surface: Slot<typeof Callout>;
  surfaceContent: Slot<typeof View>;
};

export type PopoverStateProps = {
  /**
   * Preserves unrelated consumer accessibility state on the trigger while the component owns expanded and disabled state.
   */
  accessibilityState?: AccessibilityState;
  /**
   * The initial open value when open state is internally driven. Ignored while `open` is supplied.
   */
  defaultOpen?: boolean;
  /**
   * Prevents the trigger from opening the popover and reports disabled trigger semantics.
   */
  disabled?: boolean;
  /**
   * Forces the trigger focus visual when provided.
   */
  focused?: boolean;
  /**
   * Notifies consumers with the next open value whenever trigger activation or native dismissal changes the popover, in
   * both the externally driven and internally driven cases.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether the floating surface is mounted. Supplying this prop makes open state externally driven, so the popover
   * renders what it is given and reports requests through `onOpenChange`.
   */
  open?: boolean;
  /**
   * The preferred anchor edge for the surface. The native surface owns the final position.
   */
  position?: PopoverPosition;
  /**
   * Names the floating surface. It is required and is deliberately separate from the trigger's own name, which comes
   * from the `trigger` slot.
   */
  surfaceAccessibilityLabel?: string;
};

/**
 * The root is a passive wrapper, so Popover owns every root accessibility property.
 */
export type PopoverRootProps = OwnedRootProps<
  PropsWithRefOf<typeof View>,
  | 'accessibilityElementsHidden'
  | 'accessibilityHint'
  | 'accessibilityLabel'
  | 'accessibilityLabelledBy'
  | 'accessibilityRole'
  | 'accessibilityState'
  | 'accessible'
  | 'aria-hidden'
  | 'aria-label'
  | 'aria-labelledby'
  | 'focusable'
  | 'importantForAccessibility'
  | 'role'
>;

export type PopoverProps = PopoverStateProps &
  DistributiveOmit<ComponentProps<PopoverSlots, PopoverRootProps>, 'trigger'> & {
    /**
     * Presentation for the trigger. Popover owns the trigger's role, expanded state, activation, disabled state, and
     * focusability, so those properties are not part of this type.
     */
    trigger?: PopoverTriggerProps;
  };

export type PopoverState = ComponentState<PopoverStateSlots> &
  Required<Pick<PopoverStateProps, 'position'>> &
  ThemeState &
  PressableState & {
    contentIsPlaceholder: boolean;
    disabled: boolean;
    focusVisualProps?: FocusVisualProps;
    focused: boolean;
    open: boolean;
    triggerChildren?: React.ReactNode;
    triggerUserStyle?: StyleProp<ViewStyle>;
    userStyle?: StyleProp<ViewStyle>;
  };
