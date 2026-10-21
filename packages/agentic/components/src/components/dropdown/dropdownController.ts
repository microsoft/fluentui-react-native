import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';

import type { FocusTarget } from '@fluentui-react-native/framework-base';
import type { CalloutDismissReason, NativeViewTarget } from '@fluentui-react-native/native-core/macos';

import { isKeyboardPress } from '../menu/menuFamily';
import { dropdownNativeHost } from './dropdownNative';
import type { DropdownNativeHost } from './dropdownNative.types';
import type { DropdownOpenChangeReason, DropdownStateProps } from './dropdown.types';

/** Which end of the list entry focus falls back to when no selected option is enabled. */
export type DropdownEntry = 'first' | 'last';

/** Requested presence and whether native dismissal latched the current request closed. */
interface PresenceLifetime {
  requested: boolean;
  rearm: number;
  latched: boolean;
}

export interface DropdownControllerOptions extends Pick<DropdownStateProps, 'open' | 'defaultOpen' | 'onOpenChange'> {
  disabled: boolean;
  /** The trigger's focus target, which regains focus when a focused list closes. */
  triggerFocusTarget: Pick<FocusTarget, 'requestFocus'>;
}

/** The presence part of the popup's props. */
export interface DropdownPresence {
  host: DropdownNativeHost;
  open: boolean;
  presentationKey: string;
  anchorTarget: NativeViewTarget;
  entry: DropdownEntry;
  /** Changes whenever `entry` should be applied again to a presented list. */
  entryKey: number;
  onDismissed(reason: CalloutDismissReason): void;
  /** Called when focus is confirmed anywhere in the list. */
  onFocusHeld(): void;
}

export interface DropdownController {
  /** Whether the list is presented: requested, enabled, and not natively dismissed. */
  presented: boolean;
  anchorRef: ReturnType<DropdownNativeHost['useNativeViewTarget']>['ref'];
  handlePressIn(event: GestureResponderEvent): void;
  handlePress(event: GestureResponderEvent): void;
  /** Opens the closed list from a trigger key with the given entry fallback. */
  openFromKey(entry: DropdownEntry): void;
  /** Applies an accessibility expand or collapse action on the trigger. */
  setExpanded(expanded: boolean): void;
  /** Closes the list after a single-mode commit and returns focus to the trigger. */
  closeForSelect(): void;
  presence: DropdownPresence;
}

/** Resolves the native host or throws the documented error for hosts without a modern popup route. */
function useDropdownHost(): DropdownNativeHost {
  if (!dropdownNativeHost) {
    throw new Error("Dropdown requires native-core's Callout and FocusZone, available on macOS, Windows, and Office Win32.");
  }
  return dropdownNativeHost;
}

/**
 * Requested and actual presence with Popover's latch, the trigger press policy, entry focus, and focus return to the
 * trigger.
 */
export function useDropdownController(options: DropdownControllerOptions): DropdownController {
  const host = useDropdownHost();
  const { defaultOpen = false, disabled, onOpenChange, open: openProp, triggerFocusTarget } = options;

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
  const presented = requested && !latched && !disabled;

  const latest = React.useRef({ controlled, onOpenChange, presented, requested });
  React.useLayoutEffect(() => {
    latest.current = { controlled, onOpenChange, presented, requested };
  });

  const requestOpen = React.useCallback((next: boolean, reason: DropdownOpenChangeReason) => {
    if (!latest.current.controlled) {
      setUncontrolledOpen(next);
    }
    latest.current.onOpenChange?.(next, { reason });
  }, []);

  // Disabling an uncontrolled Dropdown closes its list, so enabling it again does not reopen it.
  React.useEffect(() => {
    if (disabled && !controlled) {
      setUncontrolledOpen(false);
    }
  }, [controlled, disabled]);

  const anchor = host.useNativeViewTarget();
  const [entry, setEntry] = React.useState<{ mode: DropdownEntry; key: number }>({ mode: 'first', key: 0 });
  const heldFocus = React.useRef(false);
  const closeCause = React.useRef<DropdownOpenChangeReason | undefined>(undefined);
  const pressStartedOpen = React.useRef<boolean | undefined>(undefined);
  const [restore, setRestore] = React.useState(0);
  const triggerOpened = React.useRef(false);

  const open = React.useCallback(
    (mode: DropdownEntry) => {
      triggerOpened.current = true;
      setEntry((current) => ({ mode, key: current.key + 1 }));
      if (latest.current.requested) {
        // The request is still open but natively dismissed; an explicit trigger input rearms it.
        setRearm((value) => value + 1);
      }
      requestOpen(true, 'trigger');
    },
    [requestOpen],
  );

  const closeForSelect = React.useCallback(() => {
    if (!latest.current.presented) {
      return;
    }
    closeCause.current = 'select';
    setRestore((value) => value + 1);
    requestOpen(false, 'select');
  }, [requestOpen]);

  const onDismissed = React.useCallback(
    (reason: CalloutDismissReason) => {
      heldFocus.current = false;
      if (!latest.current.requested) {
        return;
      }
      closeCause.current = 'dismiss';
      if (latest.current.controlled) {
        setLifetime((current) => ({ ...current, latched: current.requested }));
      }
      // Escape reaches only a focused list. Tab continuation moves focus natively, and outside input relies on native
      // owner restoration, so a control the input focused keeps focus.
      if (reason === 'escape') {
        setRestore((value) => value + 1);
      }
      requestOpen(false, 'dismiss');
    },
    [requestOpen],
  );

  // A caller-driven open uses Enter's entry; a caller-driven close of a list that held focus returns focus to the
  // trigger.
  const wasRequested = React.useRef(requested);
  React.useEffect(() => {
    const opened = !wasRequested.current && requested;
    const closed = wasRequested.current && !requested;
    wasRequested.current = requested;
    if (opened && !triggerOpened.current) {
      setEntry((current) => ({ mode: 'first', key: current.key + 1 }));
    }
    triggerOpened.current = false;
    if (!closed) {
      return;
    }
    const cause = closeCause.current;
    closeCause.current = undefined;
    if (cause === undefined && heldFocus.current) {
      setRestore((value) => value + 1);
    }
    heldFocus.current = false;
  }, [requested]);

  React.useEffect(() => {
    // A caller that keeps the list open after a close request keeps focus in it.
    if (restore === 0 || latest.current.presented) {
      return undefined;
    }
    const request = triggerFocusTarget.requestFocus('restore');
    return () => request.cancel();
  }, [restore, triggerFocusTarget]);

  const handlePressIn = React.useCallback(
    (event: GestureResponderEvent) => {
      pressStartedOpen.current = latest.current.presented;
      // AppKit keeps the previous responder on a pointer press; focusing the trigger lets native owner restoration
      // return to it when outside input closes the list.
      if (!isKeyboardPress(event)) {
        triggerFocusTarget.requestFocus('pointer');
      }
    },
    [triggerFocusTarget],
  );
  const handlePress = React.useCallback(
    (_event: GestureResponderEvent) => {
      // Light dismissal can close the list between press-in and press; a press that began open never reopens it.
      const wasOpen = pressStartedOpen.current ?? latest.current.presented;
      pressStartedOpen.current = undefined;
      if (wasOpen) {
        if (latest.current.presented) {
          closeCause.current = 'trigger';
          requestOpen(false, 'trigger');
        }
        return;
      }
      open('first');
    },
    [open, requestOpen],
  );
  const openFromKey = React.useCallback(
    (mode: DropdownEntry) => {
      if (!latest.current.presented) {
        open(mode);
      }
    },
    [open],
  );
  const setExpanded = React.useCallback(
    (expanded: boolean) => {
      if (expanded) {
        openFromKey('first');
      } else if (latest.current.presented) {
        closeCause.current = 'trigger';
        // An assistive collapse can come while focus is in the list, which then returns to the trigger.
        if (heldFocus.current) {
          setRestore((value) => value + 1);
        }
        requestOpen(false, 'trigger');
      }
    },
    [openFromKey, requestOpen],
  );
  const onFocusHeld = React.useCallback(() => {
    heldFocus.current = true;
  }, []);

  return {
    presented,
    anchorRef: anchor.ref,
    handlePressIn,
    handlePress,
    openFromKey,
    setExpanded,
    closeForSelect,
    presence: {
      host,
      open: requested && !disabled,
      presentationKey: String(rearm),
      anchorTarget: anchor.target,
      entry: entry.mode,
      entryKey: entry.key,
      onDismissed,
      onFocusHeld,
    },
  };
}
