import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';

import type { FocusTarget } from '@fluentui-react-native/framework-base';
import type { CalloutDismissReason } from '@fluentui-react-native/native-core/macos';

import type { MenuEntry } from './menuContext';
import { menuPlatformDefaults } from './menuDefaults';
import { menuNativeHost } from './menuNative';
import type { MenuNativeHost } from './menuNative.types';
import type { MenuFamilyOptions, MenuPopupProps } from './menuPopup';
import { MenuSubmenuRow } from './menuSubmenu';
import type { MenuOpenChangeReason, MenuStateProps, MenuSurfaceProps } from './menu.types';

/** Requested presence and whether native dismissal latched the current request closed. */
interface PresenceLifetime {
  requested: boolean;
  rearm: number;
  latched: boolean;
}

export interface MenuControllerOptions extends MenuStateProps {
  componentName: string;
  /** The trigger's focus target, which regains focus when a focused menu closes. */
  triggerFocusTarget: Pick<FocusTarget, 'requestFocus'>;
  triggerDisabled: boolean;
  placement: MenuPopupProps['placement'];
  /** `dismiss` returns Tab to the trigger; `continue` lets native-core move focus past it. */
  tabNavigation: MenuPopupProps['tabNavigation'];
  surface?: MenuSurfaceProps;
  label?: string;
  children: React.ReactNode;
}

export interface MenuController {
  host: MenuNativeHost;
  /** Whether the menu is presented: requested, enabled, and not natively dismissed. */
  presented: boolean;
  anchorRef: ReturnType<MenuNativeHost['useNativeViewTarget']>['ref'];
  handlePressIn(event: GestureResponderEvent): void;
  handlePress(event: GestureResponderEvent): void;
  /** Opens the menu from a trigger key with the given entry focus. */
  openFromKey(entry: MenuEntry): void;
  popupProps: MenuPopupProps;
}

/** Whether a press came from Enter or Space rather than a pointer. */
export function isKeyboardPress(event: GestureResponderEvent | undefined): boolean {
  const native: object | undefined = event?.nativeEvent;
  return native != null && ('key' in native || 'code' in native);
}

/** Resolves the native host or throws the documented error for hosts without a modern popup route. */
export function useMenuHost(componentName: string): MenuNativeHost {
  if (!menuNativeHost) {
    throw new Error(
      `${componentName} requires native-core's modern Callout and FocusZone, available on macOS and Windows. Office Win32 support is tracked in #4384.`,
    );
  }
  return menuNativeHost;
}

/**
 * The root of a menu family: requested and actual presence with Popover's latch, the trigger press policy, entry
 * focus, family closure, and focus return to the trigger. Menu and MenuButton supply their own trigger.
 */
export function useMenuController(options: MenuControllerOptions): MenuController {
  const host = useMenuHost(options.componentName);
  const {
    children,
    defaultOpen = false,
    disabledFocusable = menuPlatformDefaults.disabledFocusable,
    label,
    onOpenChange,
    open: openProp,
    placement,
    submenuCloseDelay = menuPlatformDefaults.submenuCloseDelay,
    submenuOpenDelay = menuPlatformDefaults.submenuOpenDelay,
    submenuOpenOnHover = true,
    surface,
    tabNavigation,
    triggerDisabled,
    triggerFocusTarget,
  } = options;

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
  const presented = requested && !latched && !triggerDisabled;

  const latest = React.useRef({ controlled, onOpenChange, presented, requested, tabNavigation });
  React.useLayoutEffect(() => {
    latest.current = { controlled, onOpenChange, presented, requested, tabNavigation };
  });

  const requestOpen = React.useCallback((next: boolean, reason: MenuOpenChangeReason) => {
    if (!latest.current.controlled) {
      setUncontrolledOpen(next);
    }
    latest.current.onOpenChange?.(next, { reason });
  }, []);

  const anchor = host.useNativeViewTarget();
  const [entry, setEntry] = React.useState<{ mode: MenuEntry; key: number }>({ mode: 'first', key: 0 });
  const heldFocus = React.useRef(false);
  const closeCause = React.useRef<MenuOpenChangeReason | undefined>(undefined);
  const pressStartedOpen = React.useRef<boolean | undefined>(undefined);
  const [restore, setRestore] = React.useState(0);
  const triggerOpened = React.useRef(false);

  const open = React.useCallback(
    (mode: MenuEntry) => {
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

  const closeFamily = React.useCallback(() => {
    if (!latest.current.presented) {
      return;
    }
    closeCause.current = 'action';
    setRestore((value) => value + 1);
    requestOpen(false, 'action');
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
      // Escape reaches only a focused menu. Tab returns to the trigger unless native-core continued past it. Outside
      // input relies on native owner restoration, so a control the input focused keeps focus.
      const tabReturns = (reason === 'tab-forward' || reason === 'tab-backward') && latest.current.tabNavigation === 'dismiss';
      if (reason === 'escape' || tabReturns) {
        setRestore((value) => value + 1);
      }
      requestOpen(false, 'dismiss');
    },
    [requestOpen],
  );

  // A caller-driven open enters the first row; a caller-driven close of a menu that held focus returns focus to the
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
    // A caller that keeps the menu open after a close request keeps focus in it.
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
      // return to it when outside input closes the menu.
      if (!isKeyboardPress(event)) {
        triggerFocusTarget.requestFocus('pointer');
      }
    },
    [triggerFocusTarget],
  );
  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      // Light dismissal can close the menu between press-in and press; a press that began open never reopens it.
      const wasOpen = pressStartedOpen.current ?? latest.current.presented;
      pressStartedOpen.current = undefined;
      if (wasOpen) {
        if (latest.current.presented) {
          closeCause.current = 'trigger';
          requestOpen(false, 'trigger');
        }
        return;
      }
      open(isKeyboardPress(event) ? 'first' : 'surface');
    },
    [open, requestOpen],
  );
  const openFromKey = React.useCallback(
    (mode: MenuEntry) => {
      if (!latest.current.presented) {
        open(mode);
      }
    },
    [open],
  );

  const family = React.useMemo<MenuFamilyOptions>(
    () => ({
      host,
      closeFamily,
      disabledFocusable,
      hover: { enabled: submenuOpenOnHover, openDelay: submenuOpenDelay, closeDelay: submenuCloseDelay },
      SubmenuRow: MenuSubmenuRow,
    }),
    [host, closeFamily, disabledFocusable, submenuOpenOnHover, submenuOpenDelay, submenuCloseDelay],
  );
  const onFocusHeld = React.useCallback(() => {
    heldFocus.current = true;
  }, []);

  return {
    host,
    presented,
    anchorRef: anchor.ref,
    handlePressIn,
    handlePress,
    openFromKey,
    popupProps: {
      level: 0,
      open: requested && !triggerDisabled,
      presentationKey: String(rearm),
      anchorTarget: anchor.target,
      placement,
      tabNavigation,
      surface,
      label,
      entry: entry.mode,
      entryKey: entry.key,
      onDismissed,
      onFocusHeld,
      family,
      children,
    },
  };
}
