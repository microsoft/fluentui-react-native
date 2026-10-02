import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';

import { RootInputBoundary, useThemeState } from '@fluentui-react-native/design';
import {
  resolveAccessibilityAction,
  useAccessibilityLabelWarning,
  useControllableValue,
  useFocusablePressable,
  useOptionalSlot,
  useSlot,
} from '@fluentui-react-native/framework-base';

import { useFocusVisuals } from '../../common/useFocusVisuals';
import { PopoverSurface } from './PopoverSurface';
import type {
  PopoverProps,
  PopoverState,
  PopoverCompositionState,
  PopoverCompositionOptions,
  PopoverTriggerCompositionOptions,
  PopoverExternalCompositionOptions,
} from './popover.types';
import { usePopoverAnchor } from './usePopoverAnchor';
import { usePopoverMenuPresentation } from './usePopoverMenuPresentation';

export function usePopover_unstable(props: PopoverProps): PopoverState;
export function usePopover_unstable(props: PopoverProps, options: PopoverTriggerCompositionOptions): PopoverCompositionState;
export function usePopover_unstable(
  props: PopoverProps & { trigger?: never },
  options: PopoverExternalCompositionOptions,
): PopoverCompositionState;
export function usePopover_unstable(props: PopoverProps, options?: PopoverCompositionOptions): PopoverState | PopoverCompositionState {
  const mode = options?.anchor?.mode ?? 'trigger';
  const managed = options !== undefined;
  const initialMode = React.useRef({ mode, managed });
  if (initialMode.current.mode !== mode || initialMode.current.managed !== managed) {
    throw new Error('Popover: composition policy and anchor mode must remain stable for the mounted component.');
  }
  if (options && (options.host.policy !== 'menu-macos' || Platform.OS !== 'macos' || options.host.initialFocus !== 'owner')) {
    throw new Error('Popover: managed Menu composition requires the macOS owner-initial-focus policy.');
  }
  if (mode === 'external' && props.trigger !== undefined) {
    throw new Error('Popover: an external row anchor cannot render a second trigger.');
  }
  const {
    accessibilityState,
    content: contentProp,
    defaultOpen = false,
    disabled = false,
    onOpenChange,
    open: controlledOpen,
    position = 'bottomLeftEdge',
    ref: rootRef,
    style: userStyle,
    surfaceAccessibilityLabel,
    trigger: triggerProp = {},
    ...rootProps
  } = props;
  const {
    children: triggerChildren,
    onPress: triggerOnPress,
    onAccessibilityAction,
    accessibilityActions,
    ref: triggerRef,
    style: triggerUserStyle,
    ...triggerProps
  } = triggerProp;
  const [openValue, setOpen] = useControllableValue(controlledOpen, defaultOpen, onOpenChange);
  const open = openValue ?? false;
  const latestOpen = React.useRef(open);
  latestOpen.current = open;
  const requestOpen = React.useCallback(
    (next: boolean) => {
      if (latestOpen.current === next) {
        return;
      }
      if (controlledOpen === undefined) {
        latestOpen.current = next;
      }
      setOpen(next);
    },
    [controlledOpen, setOpen],
  );
  const close = React.useCallback(() => requestOpen(false), [requestOpen]);
  const anchorCancellation = React.useRef<(() => void) | undefined>(undefined);
  const anchorClose = React.useCallback(() => {
    if (managed) anchorCancellation.current?.();
    else close();
  }, [managed, close]);
  const external = options?.anchor?.mode === 'external' ? options.anchor : undefined;
  const { anchor, anchorRef, liveAnchor, isCurrent } = usePopoverAnchor(anchorClose, external);
  const menuPresentation = usePopoverMenuPresentation(options?.host, open, anchor, isCurrent, close);
  anchorCancellation.current = menuPresentation?.session.cancelAnchor;
  const expand = resolveAccessibilityAction('expand', Platform.OS, accessibilityActions);
  const collapse = resolveAccessibilityAction('collapse', Platform.OS, expand.accessibilityActions);
  const themeState = useThemeState();

  useAccessibilityLabelWarning({
    accessibilityLabel: surfaceAccessibilityLabel,
    componentName: 'Popover',
    requireLabel: true,
    warning: 'Popover: provide a surfaceAccessibilityLabel to name the floating surface.',
  });

  const [pressableProps, pressableState, focusBinding] = useFocusablePressable({
    ...triggerProps,
    role: 'button',
    accessible: true,
    disabled: disabled || mode === 'external',
    focusable: !disabled && mode !== 'external',
    accessibilityState: { ...accessibilityState, disabled, expanded: open },
    'aria-expanded': open,
    'aria-disabled': disabled,
    accessibilityActions: collapse.accessibilityActions,
    onAccessibilityAction: (event) => {
      if (!disabled) {
        const action = event.nativeEvent.actionName;
        if (action === expand.name) {
          requestOpen(true);
        } else if (action === collapse.name) {
          requestOpen(false);
        }
      }
      onAccessibilityAction?.(event);
    },
    onPress: (event) => {
      if (!disabled) {
        requestOpen(!latestOpen.current);
        triggerOnPress?.(event);
      }
    },
  });
  const { FocusRing, ...nativeFocusProps } = useFocusVisuals({ focused: pressableState.focused && !disabled && mode !== 'external' });
  const root = useSlot(View, { ...rootProps, ref: rootRef, accessible: false, focusable: false });
  const triggerPresentation = useSlot(Pressable, {
    ...pressableProps,
    ...nativeFocusProps,
    ref: triggerRef,
    testID: triggerProps.testID ?? 'popover-trigger',
  });
  const renderedTrigger = useSlot(triggerPresentation, { ref: anchorRef });
  const surfaceAnchor = options ? menuPresentation?.anchor : anchor;
  const keepClosingTransport = menuPresentation?.session.hidden && !menuPresentation.session.terminal;
  const surface = useOptionalSlot(
    PopoverSurface,
    (open || keepClosingTransport) && surfaceAnchor && (!options || menuPresentation)
      ? {
          anchor: surfaceAnchor,
          liveAnchor,
          directionalHint: position,
          onDismiss: close,
          setInitialFocus: options ? false : true,
          menuSession: menuPresentation?.session,
          menuOptions: options?.host,
          testID: 'popover-surface',
        }
      : null,
  );
  const surfaceContent = useSlot(RootInputBoundary, {
    accessible: true,
    accessibilityLabel: surfaceAccessibilityLabel,
    role: 'dialog',
    collapsable: false,
    testID: 'popover-surface-content',
  });
  const content = useOptionalSlot(View, contentProp, {
    defaultProps: { testID: 'popover-content' },
    renderByDefault: true,
  });

  return {
    root,
    trigger: mode === 'external' ? undefined : renderedTrigger,
    surface,
    surfaceContent,
    content,
    FocusRing: mode === 'external' ? undefined : FocusRing,
    ...themeState,
    ...pressableState,
    ...focusBinding,
    open,
    disabled,
    position,
    anchorRef,
    surfaceKey: options ? menuPresentation?.surfaceKey : anchor?.generation,
    contentIsPlaceholder: contentProp === undefined,
    triggerChildren,
    triggerUserStyle,
    userStyle,
  };
}
