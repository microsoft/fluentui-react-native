import type * as React from 'react';
import type { AccessibilityState, Pressable, StyleProp, TextStyle, View, ViewStyle } from 'react-native';

import type { Callout, DirectionalHint } from '@fluentui-react-native/callout';
import type { ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentProps,
  ComponentState,
  DistributiveOmit,
  OwnedRootProps,
  PressableState,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';

import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';
import type { Text } from '../text/text';
import type { TextProps } from '../text/text.types';

/**
 * Preferred placement of the label surface relative to its trigger. The native surface owns the final position, and
 * macOS resolves every alignment variant on a side to the same screen edge.
 */
export type TooltipPosition = DirectionalHint;

/**
 * Trigger properties owned by Tooltip. A consumer cannot supply them because the component cannot honor both its own
 * contract and a conflicting value. `accessibilityRole` is not owned: Tooltip describes a control rather than deciding
 * what that control is.
 */
type OwnedTriggerProps = 'accessibilityHint' | 'accessibilityState' | 'accessible' | 'aria-expanded' | 'disabled' | 'focusable';

/**
 * The presentation surface of the trigger. The pointer, focus, and press handlers are allowed and run after Tooltip's
 * own handling, and `ref` is allowed and is composed with the internal anchor ref.
 */
export type TooltipTriggerProps = DistributiveOmit<PropsWithRefOf<typeof Pressable>, OwnedTriggerProps>;

/**
 * Label properties. `children` is narrowed to a string because the same text describes the trigger and names the
 * surface, and because the label is never an interactive composition.
 */
export type TooltipContentProps = DistributiveOmit<TextProps, 'children'> & { children: string };

/**
 * The tooltip label, as either the string itself or `Text` slot properties carrying it.
 */
export type TooltipContent = string | TooltipContentProps;

export type TooltipSlots = {
  /**
   * The inline wrapper that hosts the trigger and the anchored label surface.
   */
  root: Slot<typeof View>;

  /**
   * The control the tooltip describes. It anchors the label surface and reveals it on pointer entry and focus.
   */
  trigger: Slot<typeof Pressable>;

  /**
   * The single-line label rendered inside the surface.
   */
  content: Slot<typeof Text>;
};

export type TooltipStateSlots = TooltipSlots & {
  surface: Slot<typeof Callout>;
  surfaceContent: Slot<typeof View>;
};

export type TooltipStateProps = {
  /**
   * Preserves unrelated consumer accessibility state on the trigger while the component owns disabled state.
   */
  accessibilityState?: AccessibilityState;
  /**
   * The initial visible value when visibility is internally driven. Ignored while `visible` is supplied.
   */
  defaultVisible?: boolean;
  /**
   * Prevents the trigger from revealing the tooltip and reports disabled trigger semantics. It never hides a visible
   * tooltip and never blocks a dismissal.
   */
  disabled?: boolean;
  /**
   * Forces the trigger focus visual when provided.
   */
  focused?: boolean;
  /**
   * Milliseconds between an interaction that hides the tooltip and the request itself. Defaults to 0.
   */
  hideDelay?: number;
  /**
   * Notifies consumers with the next visible value whenever an interaction or a native dismissal changes the tooltip,
   * in both the externally driven and internally driven cases.
   */
  onVisibleChange?: (visible: boolean) => void;
  /**
   * The preferred anchor edge for the label surface. The native surface owns the final position.
   */
  position?: TooltipPosition;
  /**
   * Milliseconds the pointer must rest on the trigger before the tooltip is revealed. Defaults to 300. Focus reveals
   * the tooltip immediately and is not delayed.
   */
  showDelay?: number;
  /**
   * Whether the label surface is mounted. Supplying this prop makes visibility externally driven, so the tooltip
   * renders what it is given and reports requests through `onVisibleChange`.
   */
  visible?: boolean;
};

/**
 * The root is a passive wrapper, so Tooltip owns every root accessibility property.
 */
export type TooltipRootProps = OwnedRootProps<
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

export type TooltipProps = TooltipStateProps &
  DistributiveOmit<ComponentProps<TooltipSlots, TooltipRootProps>, 'content' | 'trigger'> & {
    /**
     * The tooltip label. It is required and must resolve to a string, because the same text describes the trigger and
     * names the label surface.
     */
    content: TooltipContent;
    /**
     * Presentation for the trigger. Tooltip owns the trigger's description, accessibility state, disabled state, and
     * focusability, so those properties are not part of this type.
     */
    trigger?: TooltipTriggerProps;
  };

export type TooltipState = ComponentState<TooltipStateSlots> &
  Required<Pick<TooltipStateProps, 'hideDelay' | 'position' | 'showDelay'>> &
  ThemeState &
  PressableState & {
    contentUserStyle?: StyleProp<TextStyle>;
    disabled: boolean;
    focusVisualProps?: FocusVisualProps;
    focused: boolean;
    triggerChildren?: React.ReactNode;
    triggerUserStyle?: StyleProp<ViewStyle>;
    userStyle?: StyleProp<ViewStyle>;
    visible: boolean;
  };
