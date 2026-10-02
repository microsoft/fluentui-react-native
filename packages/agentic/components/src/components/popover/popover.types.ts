import type * as React from 'react';
import type { AccessibilityState, Pressable, StyleProp, View, ViewStyle } from 'react-native';

import type {
  CalloutHandle,
  CalloutProps,
  CalloutReadyEvent,
  CalloutDismissContextEvent,
  DirectionalHint,
} from '@fluentui-react-native/callout';
import type { RootInputBoundary, ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentProps,
  ComponentState,
  DistributiveOmit,
  FocusTargetBinding,
  FocusTarget,
  OptionalSlot,
  OwnedRootProps,
  PressableState,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';

import type { FocusVisualsSlots } from '../../common/useFocusVisuals';
import type { PopoverSurface } from './PopoverSurface';

export type PopoverPosition = DirectionalHint;

export type PopoverTriggerProps = DistributiveOmit<
  PropsWithRefOf<typeof Pressable>,
  'accessibilityRole' | 'accessibilityState' | 'accessible' | 'aria-expanded' | 'aria-disabled' | 'disabled' | 'focusable' | 'role'
>;

export type PopoverSlots = {
  root: Slot<typeof View>;
  trigger: Slot<typeof Pressable>;
  content: OptionalSlot<typeof View>;
};

type PopoverStateSlots = PopoverSlots &
  FocusVisualsSlots & {
    surface: OptionalSlot<typeof PopoverSurface>;
    surfaceContent: Slot<typeof RootInputBoundary>;
  };

export type PopoverStateProps = {
  /** Unrelated caller state is preserved on the trigger. */
  accessibilityState?: AccessibilityState;
  defaultOpen?: boolean;
  disabled?: boolean;
  /** Requests the next open value; controlled values remain externally owned. */
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  /** Preferred native placement, not guaranteed alignment or containment. */
  position?: PopoverPosition;
  /** Required accessible name for the popup, independent of the trigger name. */
  surfaceAccessibilityLabel?: string;
};

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
  | 'aria-expanded'
  | 'aria-disabled'
  | 'focusable'
  | 'importantForAccessibility'
  | 'role'
>;

export type PopoverProps = PopoverStateProps &
  DistributiveOmit<ComponentProps<PopoverSlots, PopoverRootProps>, 'trigger'> & {
    trigger?: PopoverTriggerProps;
  };

export type PopoverState = ComponentState<PopoverStateSlots> &
  FocusTargetBinding &
  ThemeState &
  PressableState & {
    open: boolean;
    disabled: boolean;
    position: PopoverPosition;
    anchorRef: React.RefCallback<React.ComponentRef<typeof Pressable>>;
    surfaceKey?: number;
    contentIsPlaceholder: boolean;
    triggerChildren?: PopoverTriggerProps['children'];
    triggerUserStyle?: PopoverTriggerProps['style'];
    userStyle?: StyleProp<ViewStyle>;
  };

export type PopoverAnchorLifetime = Pick<FocusTarget, 'current' | 'generation' | 'getSnapshot' | 'subscribe'>;

export type PopoverCommittedAnchor = {
  readonly nativeRef: React.RefObject<React.ComponentRef<typeof View> | null>;
  readonly mountGeneration: number;
  readonly lifetime: PopoverAnchorLifetime;
};

export type PopoverMenuHostHandle = Pick<CalloutHandle, 'focusInitialChild' | 'focusOwnedChild' | 'closeOwned'>;

export type PopoverMenuHostSnapshot = {
  readonly handle: PopoverMenuHostHandle;
  readonly anchorMountGeneration: number;
  readonly signal: AbortSignal;
} & (
  | { readonly phase: 'mounted'; readonly nativeGeneration?: never }
  | { readonly phase: 'ready'; readonly nativeGeneration: CalloutReadyEvent['nativeEvent']['generation'] }
);

export type PopoverMenuHostBinding = {
  getCurrent(): PopoverMenuHostSnapshot | undefined;
};

export type PopoverMenuHostOptions = {
  readonly policy: 'menu-macos';
  readonly initialFocus: 'owner';
  readonly presentationKey: string | number;
  readonly bindingRef?: React.Ref<PopoverMenuHostBinding>;
  readonly onReady?: (event: CalloutReadyEvent, binding: PopoverMenuHostBinding) => void;
  readonly onDismissContext?: (event: CalloutDismissContextEvent, binding: PopoverMenuHostBinding) => void;
  readonly onPointerMove?: (event: Parameters<NonNullable<CalloutProps['onMenuPointerMove']>>[0], binding: PopoverMenuHostBinding) => void;
  readonly onShow?: CalloutProps['onShow'];
  readonly onDismiss?: CalloutProps['onDismiss'];
};

export type PopoverTriggerCompositionOptions = {
  readonly host: PopoverMenuHostOptions;
  readonly anchor?: { readonly mode: 'trigger' };
};

export type PopoverExternalCompositionOptions = {
  readonly host: PopoverMenuHostOptions;
  readonly anchor: { readonly mode: 'external'; readonly attachment: PopoverCommittedAnchor | null };
};

export type PopoverCompositionOptions = PopoverTriggerCompositionOptions | PopoverExternalCompositionOptions;

/** Composition may omit its trigger; ordinary PopoverState retains a required trigger. */
export type PopoverCompositionState = Omit<PopoverState, 'trigger'> &
  ThemeState & {
    trigger: PopoverState['trigger'] | undefined;
  };
