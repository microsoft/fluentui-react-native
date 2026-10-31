import * as React from 'react';
import { View } from 'react-native';

import { RootInputBoundary, useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useFocusTarget, useSlot } from '@fluentui-react-native/framework-base';
import type {
  CalloutDismissedEvent,
  CalloutHandle,
  CalloutPresentation,
  CalloutReadyEvent,
} from '@fluentui-react-native/native-core/macos';

import { composeHandlers } from '../../common/eventHandlers';
import { popupHost } from '../../common/popupHost';
import { withTriggerExpandActions } from '../../common/triggerExpandActions';
import { usePopupPresence } from '../../common/usePopupPresence';
import { Button } from '../button/button';
import type { ButtonProps } from '../button/button.types';
import { PopoverSurfaceContext } from './popoverContext';
import type { PopoverOpenChangeReason, PopoverProps, PopoverState } from './popover.types';

const defaultTriggerHint = 'Opens a popover';

/**
 * Resolves Popover state: requested and actual presence, the trigger, the native popup, entry focus, and focus return.
 * Native presence is authoritative; a native dismissal latches a controlled request closed until it is rearmed.
 */
export function usePopover_unstable(props: PopoverProps): PopoverState {
  const host = popupHost;
  if (!host) {
    throw new Error("Popover requires native-core's Callout, available on macOS, Windows, and Win32.");
  }
  const {
    align = 'center',
    children,
    defaultOpen = false,
    onOpenChange,
    open: openProp,
    placement = 'bottom',
    style: userStyle,
    surface: surfaceProp,
    trigger: triggerProp,
    ...rootProps
  } = props;
  const themeState = useThemeState();

  const nested = React.useContext(PopoverSurfaceContext);
  React.useEffect(() => {
    if (__DEV__ && nested) {
      console.warn('Popover: do not render a Popover inside another Popover.');
    }
  }, [nested]);

  const { style: surfaceUserStyle, ...surfaceProps } = surfaceProp ?? {};
  useAccessibilityLabelWarning({
    componentName: 'Popover',
    accessibilityLabel: surfaceProps.accessibilityLabel ?? surfaceProps['aria-label'],
    accessibilityLabelledBy: surfaceProps.accessibilityLabelledBy ?? surfaceProps['aria-labelledby'],
    requireLabel: true,
    warning: 'Popover: name the surface with an accessibilityLabel.',
  });

  const { latchDismissed, latest, presentationKey, presented, rearm, requestOpen, requested } = usePopupPresence({
    open: openProp,
    defaultOpen,
    onOpenChange,
  });

  const anchor = host.useNativeViewTarget();
  const surfaceTarget = host.useNativeViewTarget();
  const calloutHandle = React.useRef<CalloutHandle>(null);
  const triggerFocus = useFocusTarget(triggerProp.disabled !== true);

  // The presentation whose entry focus was confirmed, which therefore held focus when it closed.
  const focusedPresentation = React.useRef<CalloutPresentation | null>(null);
  const closeCause = React.useRef<PopoverOpenChangeReason | undefined>(undefined);
  const pressStartedOpen = React.useRef<boolean | undefined>(undefined);
  const [fallback, setFallback] = React.useState<CalloutPresentation | null>(null);
  const [restore, setRestore] = React.useState(0);

  const handleReady = React.useCallback(({ presentation }: CalloutReadyEvent) => {
    closeCause.current = undefined;
    const api = calloutHandle.current;
    if (!api) {
      return;
    }
    void api.requestFocus(presentation, 'first').then(({ status }) => {
      if (status === 'confirmed') {
        focusedPresentation.current = presentation;
      } else if (status === 'not-mounted' && api.getPresentation() === presentation) {
        // No eligible content: make the surface a focus stop, then focus it after that change commits.
        setFallback(presentation);
      }
    });
  }, []);

  React.useEffect(() => {
    const api = calloutHandle.current;
    if (!fallback || !api || api.getPresentation() !== fallback) {
      return undefined;
    }
    let current = true;
    void api.requestFocus(fallback, surfaceTarget.target).then(({ status }) => {
      if (current && status === 'confirmed') {
        focusedPresentation.current = fallback;
      }
    });
    return () => {
      current = false;
    };
  }, [fallback, surfaceTarget]);

  const handleDismissed = React.useCallback(
    ({ reason }: CalloutDismissedEvent) => {
      focusedPresentation.current = null;
      setFallback(null);
      if (!latest.current.requested) {
        return;
      }
      closeCause.current = 'dismiss';
      latchDismissed();
      // Escape reaches only a focused popup, so the trigger regains focus. Other causes leave focus where it is.
      if (reason === 'escape') {
        setRestore((value) => value + 1);
      }
      requestOpen(false, 'dismiss');
    },
    [latchDismissed, latest, requestOpen],
  );

  // A caller-driven close of a presentation that held focus returns focus to the trigger.
  const wasRequested = React.useRef(requested);
  React.useEffect(() => {
    const closed = wasRequested.current && !requested;
    wasRequested.current = requested;
    if (!closed) {
      return;
    }
    const cause = closeCause.current;
    const heldFocus = focusedPresentation.current !== null;
    closeCause.current = undefined;
    focusedPresentation.current = null;
    setFallback(null);
    if (cause === undefined && heldFocus) {
      setRestore((value) => value + 1);
    }
  }, [requested]);

  React.useEffect(() => {
    if (restore === 0) {
      return undefined;
    }
    const request = triggerFocus.focusTarget.requestFocus('restore');
    return () => request.cancel();
  }, [restore, triggerFocus.focusTarget]);

  const setExpanded = React.useCallback(
    (next: boolean) => {
      if (next === latest.current.presented) {
        return;
      }
      if (!next) {
        closeCause.current = 'trigger';
      } else if (latest.current.requested) {
        // The request is still open but natively dismissed; an explicit expansion rearms it.
        rearm();
      }
      requestOpen(next, 'trigger');
    },
    [latest, rearm, requestOpen],
  );

  const handlePressIn = React.useCallback(() => {
    pressStartedOpen.current = latest.current.presented;
  }, [latest]);
  const handlePress = React.useCallback(() => {
    // Light dismissal can close the popup between press-in and press; a press that began open never reopens it.
    const wasOpen = pressStartedOpen.current ?? latest.current.presented;
    pressStartedOpen.current = undefined;
    if (wasOpen) {
      setExpanded(false);
      return;
    }
    if (latest.current.requested) {
      // The request is still open but natively dismissed; an explicit trigger press rearms it.
      rearm();
    }
    requestOpen(true, 'trigger');
  }, [latest, rearm, requestOpen, setExpanded]);

  const root = useSlot(View, rootProps);
  const trigger = useSlot(Button, triggerProp, {
    transform: (slotProps: ButtonProps) =>
      withTriggerExpandActions(
        {
          ...slotProps,
          accessibilityHint: slotProps.accessibilityHint ?? defaultTriggerHint,
          accessibilityState: { ...slotProps.accessibilityState, expanded: presented },
          onBlur: composeHandlers(slotProps.onBlur, triggerFocus.onBlur),
          onFocus: composeHandlers(slotProps.onFocus, triggerFocus.onFocus),
          onPress: composeHandlers(slotProps.onPress, handlePress),
          onPressIn: composeHandlers(handlePressIn, slotProps.onPressIn),
          ref: triggerFocus.focusTargetRef,
        },
        setExpanded,
      ),
  });
  const callout = useSlot(host.Callout, {
    ref: calloutHandle,
    open: requested,
    presentationKey,
    anchor: { kind: 'view', target: anchor.target },
    onReady: handleReady,
    onDismissed: handleDismissed,
    content: {
      accessible: true,
      role: 'group',
      ...surfaceProps,
      focusable: fallback !== null || surfaceProps.focusable === true,
    },
  });
  const inputBoundary = useSlot(RootInputBoundary, {});

  return {
    ...themeState,
    root,
    trigger,
    callout,
    inputBoundary,
    open: presented,
    placement,
    align,
    children,
    anchorRef: anchor.ref,
    surfaceTargetRef: surfaceTarget.ref,
    userStyle,
    surfaceUserStyle,
  };
}
