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

import { withTriggerExpandActions } from '../../common/triggerExpandActions';
import { Button } from '../button/button';
import type { ButtonProps } from '../button/button.types';
import { PopoverSurfaceContext } from './popoverContext';
import { popoverNativeHost } from './popoverNative';
import type { PopoverOpenChangeReason, PopoverProps, PopoverState } from './popover.types';

const defaultTriggerHint = 'Opens a popover';

function composeHandlers<TArgs extends unknown[]>(...handlers: (((...args: TArgs) => void) | undefined)[]) {
  return (...args: TArgs) => {
    for (const handler of handlers) {
      handler?.(...args);
    }
  };
}

/** Requested presence and whether native dismissal latched the current request closed. */
interface PresenceLifetime {
  requested: boolean;
  rearm: number;
  latched: boolean;
}

/**
 * Resolves Popover state: requested and actual presence, the trigger, the native popup, entry focus, and focus return.
 * Native presence is authoritative; a native dismissal latches a controlled request closed until it is rearmed.
 */
export function usePopover_unstable(props: PopoverProps): PopoverState {
  const host = popoverNativeHost;
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

  const controlled = openProp !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const requested = controlled ? openProp : uncontrolledOpen;
  const [rearm, setRearm] = React.useState(0);
  const [lifetime, setLifetime] = React.useState<PresenceLifetime>(() => ({ requested, rearm, latched: false }));
  // A new request or an explicit rearm clears the latch in the same render that presents it.
  const latched = lifetime.requested === requested && lifetime.rearm === rearm && lifetime.latched;
  if (lifetime.requested !== requested || lifetime.rearm !== rearm) {
    setLifetime({ requested, rearm, latched: false });
  }
  const presented = requested && !latched;

  const latest = React.useRef({ controlled, onOpenChange, presented, requested });
  React.useLayoutEffect(() => {
    latest.current = { controlled, onOpenChange, presented, requested };
  });

  const requestOpen = React.useCallback((next: boolean, reason: PopoverOpenChangeReason) => {
    if (!latest.current.controlled) {
      setUncontrolledOpen(next);
    }
    latest.current.onOpenChange?.(next, { reason });
  }, []);

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
      if (latest.current.controlled) {
        setLifetime((current) => ({ ...current, latched: current.requested }));
      }
      // Escape reaches only a focused popup, so the trigger regains focus. Other causes leave focus where it is.
      if (reason === 'escape') {
        setRestore((value) => value + 1);
      }
      requestOpen(false, 'dismiss');
    },
    [requestOpen],
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
        setRearm((value) => value + 1);
      }
      requestOpen(next, 'trigger');
    },
    [requestOpen],
  );

  const handlePressIn = React.useCallback(() => {
    pressStartedOpen.current = latest.current.presented;
  }, []);
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
      setRearm((value) => value + 1);
    }
    requestOpen(true, 'trigger');
  }, [requestOpen, setExpanded]);

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
    presentationKey: String(rearm),
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
