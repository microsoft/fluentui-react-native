import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';

import type { FocusTarget } from '@fluentui-react-native/framework-base';
import type { CalloutDismissReason, NativeViewTarget } from '@fluentui-react-native/native-core/macos';

import { popupHost } from '../../common/popupHost';
import type { PopupHost } from '../../common/popupHost.types';
import { usePopupTrigger } from '../../common/usePopupTrigger';
import type { DropdownStateProps } from './dropdown.types';

/** Which end of the list entry focus falls back to when no selected option is enabled. */
export type DropdownEntry = 'first' | 'last';

export interface DropdownControllerOptions extends Pick<DropdownStateProps, 'open' | 'defaultOpen' | 'onOpenChange'> {
  disabled: boolean;
  /** The trigger's focus target, which regains focus when a focused list closes. */
  triggerFocusTarget: Pick<FocusTarget, 'requestFocus'>;
}

/** The presence part of the popup's props. */
export interface DropdownPresence {
  host: PopupHost;
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
  anchorRef: ReturnType<PopupHost['useNativeViewTarget']>['ref'];
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
function useDropdownHost(): PopupHost {
  if (!popupHost) {
    throw new Error("Dropdown requires native-core's Callout and FocusZone, available on macOS, Windows, and Office Win32.");
  }
  return popupHost;
}

// Escape reaches only a focused list. Tab continuation moves focus natively.
const restoresFocusOnDismiss = (reason: CalloutDismissReason) => reason === 'escape';

/**
 * Requested and actual presence with Popover's latch, the trigger press policy, entry focus, and focus return to the
 * trigger.
 */
export function useDropdownController(options: DropdownControllerOptions): DropdownController {
  const host = useDropdownHost();
  const { defaultOpen, disabled, onOpenChange, open, triggerFocusTarget } = options;

  // Disabling an uncontrolled Dropdown closes its list, so enabling it again does not reopen it.
  const trigger = usePopupTrigger<DropdownEntry, 'select'>({
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    closeWhenDisabled: true,
    triggerFocusTarget,
    pointerEntry: 'first',
    restoresFocusOnDismiss,
  });
  const { closeAndRestore } = trigger;
  const anchor = host.useNativeViewTarget();
  const closeForSelect = React.useCallback(() => closeAndRestore('select'), [closeAndRestore]);

  return {
    presented: trigger.presented,
    anchorRef: anchor.ref,
    handlePressIn: trigger.handlePressIn,
    handlePress: trigger.handlePress,
    openFromKey: trigger.openFromKey,
    setExpanded: trigger.setExpanded,
    closeForSelect,
    presence: {
      host,
      open: trigger.open,
      presentationKey: trigger.presentationKey,
      anchorTarget: anchor.target,
      entry: trigger.entry,
      entryKey: trigger.entryKey,
      onDismissed: trigger.onDismissed,
      onFocusHeld: trigger.onFocusHeld,
    },
  };
}
