import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';

import type { FocusTarget } from '@fluentui-react-native/framework-base';

import { popupHost } from '../../common/popupHost';
import type { PopupHost } from '../../common/popupHost.types';
import { usePopupTrigger } from '../../common/usePopupTrigger';
import type { MenuEntry } from './menuContext';
import { menuPlatformDefaults } from './menuDefaults';
import type { MenuFamilyOptions, MenuPopupProps } from './menuPopup';
import { MenuSubmenuRow } from './menuSubmenu';
import type { MenuStateProps, MenuSurfaceProps } from './menu.types';

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
  host: PopupHost;
  /** Whether the menu is presented: requested, enabled, and not natively dismissed. */
  presented: boolean;
  anchorRef: ReturnType<PopupHost['useNativeViewTarget']>['ref'];
  handlePressIn(event: GestureResponderEvent): void;
  handlePress(event: GestureResponderEvent): void;
  /** Opens the menu from a trigger key with the given entry focus. */
  openFromKey(entry: MenuEntry): void;
  /** Applies an accessibility expand or collapse action on the trigger. */
  setExpanded(expanded: boolean): void;
  popupProps: MenuPopupProps;
}

/** Resolves the native host or throws the documented error for hosts without a modern popup route. */
export function useMenuHost(componentName: string): PopupHost {
  if (!popupHost) {
    throw new Error(`${componentName} requires native-core's Callout and FocusZone, available on macOS, Windows, and Office Win32.`);
  }
  return popupHost;
}

/**
 * The root of a menu family: requested and actual presence with Popover's latch, the trigger press policy, entry
 * focus, family closure, and focus return to the trigger. Menu and MenuButton supply their own trigger.
 */
export function useMenuController(options: MenuControllerOptions): MenuController {
  const host = useMenuHost(options.componentName);
  const {
    children,
    defaultOpen,
    disabledFocusable = menuPlatformDefaults.disabledFocusable,
    label,
    onOpenChange,
    open,
    placement,
    submenuCloseDelay = menuPlatformDefaults.submenuCloseDelay,
    submenuOpenDelay = menuPlatformDefaults.submenuOpenDelay,
    submenuOpenOnHover = true,
    surface,
    tabNavigation,
    triggerDisabled,
    triggerFocusTarget,
  } = options;

  const trigger = usePopupTrigger<MenuEntry, 'action'>({
    open,
    defaultOpen,
    onOpenChange,
    disabled: triggerDisabled,
    triggerFocusTarget,
    pointerEntry: 'surface',
    // Escape reaches only a focused menu. Tab returns to the trigger unless native-core continued past it.
    restoresFocusOnDismiss: (reason) =>
      reason === 'escape' || ((reason === 'tab-forward' || reason === 'tab-backward') && tabNavigation === 'dismiss'),
  });
  const { closeAndRestore } = trigger;
  const anchor = host.useNativeViewTarget();

  const closeFamily = React.useCallback(() => closeAndRestore('action'), [closeAndRestore]);
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

  return {
    host,
    presented: trigger.presented,
    anchorRef: anchor.ref,
    handlePressIn: trigger.handlePressIn,
    handlePress: trigger.handlePress,
    openFromKey: trigger.openFromKey,
    setExpanded: trigger.setExpanded,
    popupProps: {
      level: 0,
      open: trigger.open,
      presentationKey: trigger.presentationKey,
      anchorTarget: anchor.target,
      placement,
      tabNavigation,
      surface,
      label,
      entry: trigger.entry,
      entryKey: trigger.entryKey,
      onDismissed: trigger.onDismissed,
      onFocusHeld: trigger.onFocusHeld,
      family,
      children,
    },
  };
}
