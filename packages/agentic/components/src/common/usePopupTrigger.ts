import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';

import type { FocusTarget } from '@fluentui-react-native/framework-base';
import type { CalloutDismissReason } from '@fluentui-react-native/native-core/macos';

import { isKeyboardPress } from './eventHandlers';
import type { PopupOpenChangeReason, PopupPresenceOptions } from './usePopupPresence';
import { usePopupPresence } from './usePopupPresence';

export interface PopupTriggerOptions<TEntry extends string, TCloseReason extends string> extends PopupPresenceOptions<
  PopupOpenChangeReason | TCloseReason
> {
  /** The trigger's focus target, which regains focus when a focused popup closes. */
  triggerFocusTarget: Pick<FocusTarget, 'requestFocus'>;
  /** The entry focus for a pointer press; a key press, assistive expansion, or caller-driven open enters the first row. */
  pointerEntry: TEntry | 'first';
  /** Whether a native dismissal for this reason returns focus to the trigger. Escape reaches only a focused popup. */
  restoresFocusOnDismiss(reason: CalloutDismissReason): boolean;
}

export interface PopupTrigger<TEntry extends string, TCloseReason extends string> {
  /** Whether the popup is presented: requested, enabled, and not natively dismissed. */
  presented: boolean;
  /** Requested presence for the popup, which is never requested while disabled. */
  open: boolean;
  presentationKey: string;
  entry: TEntry | 'first';
  /** Changes whenever `entry` should be applied again to a presented popup. */
  entryKey: number;
  handlePressIn(event: GestureResponderEvent): void;
  handlePress(event: GestureResponderEvent): void;
  /** Opens the closed popup from a trigger key with the given entry focus. */
  openFromKey(entry: TEntry | 'first'): void;
  /** Applies an accessibility expand or collapse action on the trigger. */
  setExpanded(expanded: boolean): void;
  /** Closes a presented popup for a completed action and returns focus to the trigger. */
  closeAndRestore(reason: TCloseReason): void;
  onDismissed(reason: CalloutDismissReason): void;
  /** Called when focus is confirmed anywhere in the popup. */
  onFocusHeld(): void;
}

/**
 * The trigger side of a list popup (Menu and Dropdown): presence with the native dismissal latch, the press policy,
 * entry focus, and focus return to the trigger. A press that began open closes; a press that began closed opens.
 */
export function usePopupTrigger<TEntry extends string, TCloseReason extends string>(
  options: PopupTriggerOptions<TEntry, TCloseReason>,
): PopupTrigger<TEntry, TCloseReason> {
  const { disabled = false, pointerEntry, triggerFocusTarget } = options;
  const presence = usePopupPresence(options);
  const { latchDismissed, latest, rearm, requestOpen, requested } = presence;

  const restoresFocusOnDismiss = React.useRef(options.restoresFocusOnDismiss);
  React.useLayoutEffect(() => {
    restoresFocusOnDismiss.current = options.restoresFocusOnDismiss;
  });

  const [entry, setEntry] = React.useState<{ mode: TEntry | 'first'; key: number }>({ mode: 'first', key: 0 });
  const heldFocus = React.useRef(false);
  const closeCause = React.useRef<PopupOpenChangeReason | TCloseReason | undefined>(undefined);
  const pressStartedOpen = React.useRef<boolean | undefined>(undefined);
  const [restore, setRestore] = React.useState(0);
  const triggerOpened = React.useRef(false);

  const open = React.useCallback(
    (mode: TEntry | 'first') => {
      triggerOpened.current = true;
      setEntry((current) => ({ mode, key: current.key + 1 }));
      if (latest.current.requested) {
        // The request is still open but natively dismissed; an explicit trigger input rearms it.
        rearm();
      }
      requestOpen(true, 'trigger');
    },
    [latest, rearm, requestOpen],
  );

  const closeAndRestore = React.useCallback(
    (reason: TCloseReason) => {
      if (!latest.current.presented) {
        return;
      }
      closeCause.current = reason;
      setRestore((value) => value + 1);
      requestOpen(false, reason);
    },
    [latest, requestOpen],
  );

  const onDismissed = React.useCallback(
    (reason: CalloutDismissReason) => {
      heldFocus.current = false;
      if (!latest.current.requested) {
        return;
      }
      closeCause.current = 'dismiss';
      latchDismissed();
      // Outside input relies on native owner restoration, so a control the input focused keeps focus.
      if (restoresFocusOnDismiss.current(reason)) {
        setRestore((value) => value + 1);
      }
      requestOpen(false, 'dismiss');
    },
    [latchDismissed, latest, requestOpen],
  );

  // A caller-driven open enters the first row; a caller-driven close of a popup that held focus returns focus to the
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
    // A caller that keeps the popup open after a close request keeps focus in it.
    if (restore === 0 || latest.current.presented) {
      return undefined;
    }
    const request = triggerFocusTarget.requestFocus('restore');
    return () => request.cancel();
  }, [latest, restore, triggerFocusTarget]);

  const handlePressIn = React.useCallback(
    (event: GestureResponderEvent) => {
      pressStartedOpen.current = latest.current.presented;
      // AppKit keeps the previous responder on a pointer press; focusing the trigger lets native owner restoration
      // return to it when outside input closes the popup.
      if (!isKeyboardPress(event)) {
        triggerFocusTarget.requestFocus('pointer');
      }
    },
    [latest, triggerFocusTarget],
  );
  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      // Light dismissal can close the popup between press-in and press; a press that began open never reopens it.
      const wasOpen = pressStartedOpen.current ?? latest.current.presented;
      pressStartedOpen.current = undefined;
      if (wasOpen) {
        if (latest.current.presented) {
          closeCause.current = 'trigger';
          requestOpen(false, 'trigger');
        }
        return;
      }
      open(isKeyboardPress(event) ? 'first' : pointerEntry);
    },
    [latest, open, pointerEntry, requestOpen],
  );
  const openFromKey = React.useCallback(
    (mode: TEntry | 'first') => {
      if (!latest.current.presented) {
        open(mode);
      }
    },
    [latest, open],
  );
  const setExpanded = React.useCallback(
    (expanded: boolean) => {
      if (expanded) {
        openFromKey('first');
      } else if (latest.current.presented) {
        closeCause.current = 'trigger';
        // An assistive collapse can come while focus is in the popup, which then returns to the trigger.
        if (heldFocus.current) {
          setRestore((value) => value + 1);
        }
        requestOpen(false, 'trigger');
      }
    },
    [latest, openFromKey, requestOpen],
  );
  const onFocusHeld = React.useCallback(() => {
    heldFocus.current = true;
  }, []);

  return {
    presented: presence.presented,
    open: requested && !disabled,
    presentationKey: presence.presentationKey,
    entry: entry.mode,
    entryKey: entry.key,
    handlePressIn,
    handlePress,
    openFromKey,
    setExpanded,
    closeAndRestore,
    onDismissed,
    onFocusHeld,
  };
}
