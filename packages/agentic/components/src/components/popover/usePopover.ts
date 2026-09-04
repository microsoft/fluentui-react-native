import * as React from 'react';
import { Pressable, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';

import { Callout } from '@fluentui-react-native/callout';
import { useThemeState } from '@fluentui-react-native/design';
import {
  useAccessibilityLabelWarning,
  useControllableValue,
  useOptionalSlot,
  usePressableState,
  useSlot,
} from '@fluentui-react-native/framework-base';

import { resolveFocusable } from '../../common/interaction';
import type { PopoverProps, PopoverState, PopoverTriggerProps } from './popover.types';

const defaultPosition = 'bottomLeftEdge';

type TriggerRef = PopoverTriggerProps['ref'];

/**
 * Creates the resolved Popover state, accessibility, interaction, and slots.
 */
export function usePopover_unstable(props: PopoverProps): PopoverState {
  const {
    accessibilityState,
    content: contentProp,
    defaultOpen,
    disabled = false,
    focused: focusedProp,
    onOpenChange,
    open: openProp,
    position = defaultPosition,
    style: userStyle,
    surfaceAccessibilityLabel,
    trigger: triggerProp,
    ...rootProps
  } = props;

  const {
    children: triggerChildren,
    onPress: triggerOnPress,
    ref: triggerRef,
    style: triggerUserStyle,
    ...triggerPresentationProps
  } = (triggerProp ?? {}) as PopoverTriggerProps;

  const [openValue, setOpen] = useControllableValue(openProp, defaultOpen ?? false, onOpenChange);
  const open = openValue ?? false;

  useAccessibilityLabelWarning({
    accessibilityLabel: surfaceAccessibilityLabel,
    componentName: 'Popover',
    requireLabel: true,
    warning: 'Popover: provide a surfaceAccessibilityLabel to name the floating surface.',
  });

  // The native surface positions itself against a component instance, so the anchor has to be a ref object that is
  // populated before the surface mounts. A consumer ref on the trigger slot is composed with it rather than replaced.
  const anchorRef = React.useRef<React.Component | null>(null);
  const setTriggerRef = React.useCallback(
    (instance: React.Component | null) => {
      anchorRef.current = instance;
      if (typeof triggerRef === 'function') {
        triggerRef(instance as never);
      } else if (triggerRef) {
        (triggerRef as React.RefObject<unknown>).current = instance;
      }
    },
    [triggerRef],
  );

  const handleTriggerPress = React.useCallback(
    (event: GestureResponderEvent) => {
      if (!disabled) {
        setOpen(!open);
      }
      triggerOnPress?.(event);
    },
    [disabled, open, setOpen, triggerOnPress],
  );
  const handleDismiss = React.useCallback(() => setOpen(false), [setOpen]);

  const themeState = useThemeState();
  const [triggerProps, pressableState] = usePressableState({
    ...triggerPresentationProps,
    onPress: handleTriggerPress,
  });

  const root = useSlot(View, {
    ...rootProps,
    accessible: false,
    style: userStyle,
  });
  const trigger = useSlot(Pressable, {
    ...triggerProps,
    role: 'button',
    accessibilityState: { ...accessibilityState, disabled, expanded: open },
    accessible: true,
    'aria-expanded': open,
    disabled,
    focusable: resolveFocusable(triggerProps.focusable, disabled),
    ref: setTriggerRef as TriggerRef,
    testID: triggerProps.testID ?? 'popover-trigger',
  });
  // Callout resolves its anchor during its own hook phase, so the slot is created on every render and only rendered
  // while the popover is open.
  const surface = useSlot(Callout, {
    directionalHint: position,
    onDismiss: handleDismiss,
    setInitialFocus: true,
    target: anchorRef,
    testID: 'popover-surface',
  });
  const surfaceContent = useSlot(View, {
    accessibilityLabel: surfaceAccessibilityLabel,
    role: 'dialog',
    accessible: true,
    collapsable: false,
    testID: 'popover-surface-content',
  });
  const content = useOptionalSlot(View, contentProp, {
    defaultProps: { testID: 'popover-content' },
    renderByDefault: true,
  });

  return {
    root,
    trigger,
    content,
    surface,
    surfaceContent,
    contentIsPlaceholder: contentProp === undefined,
    disabled,
    open,
    position,
    triggerChildren,
    triggerUserStyle,
    userStyle,
    ...themeState,
    ...pressableState,
    focused: focusedProp ?? pressableState.focused,
  };
}
