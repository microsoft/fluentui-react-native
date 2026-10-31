/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { I18nManager, View } from 'react-native';
import type { NativeSyntheticEvent, StyleProp, TargetedEvent, ViewStyle } from 'react-native';

import { RootInputBoundary } from '@fluentui-react-native/design';
import type { FocusKeyboardEvent } from '@fluentui-react-native/framework-base';
import type {
  CalloutDismissReason,
  CalloutHandle,
  CalloutPresentation,
  FocusZoneCommands,
  NativeViewTarget,
} from '@fluentui-react-native/native-core/macos';

import { composeRefs } from '../../common/composeRefs';
import { popupLayoutStyles } from '../../common/popupLayout';
import type { MenuItemMenuBinding, MenuItemMenuRow } from '../menu-item/menuItemContext';
import { MenuItemMenuContext } from '../menu-item/menuItemContext';
import type { MenuEntry, MenuFamily, MenuLevel, MenuOpenChild } from './menuContext';
import { MenuFamilyContext, MenuLevelContext, maxSubmenuLevel } from './menuContext';
import { findTypeAheadRow, getInlineArrows, getTypeAheadCharacter } from './menuNavigation';
import type { MenuSurfaceProps } from './menu.types';

// The surface handles these while it holds focus after a pointer open; declaring them stops native handling.
const surfaceKeys = [{ key: 'ArrowDown' }, { key: 'ArrowUp' }, { key: 'Home' }, { key: 'End' }];

/** The family options a root popup creates; submenu popups inherit them. */
export type MenuFamilyOptions = Omit<MenuFamily, 'rtl' | 'surfaceStyle' | 'gap'>;

export interface MenuPopupProps {
  level: number;
  /** Requested presence for this popup. */
  open: boolean;
  presentationKey?: string;
  anchorTarget: NativeViewTarget;
  placement: { side: 'top' | 'bottom' | 'start' | 'end'; align: 'start' | 'center' | 'end' };
  tabNavigation: 'dismiss' | 'continue';
  surface?: MenuSurfaceProps;
  /** The accessible name used when the surface has none. */
  label?: string;
  entry: MenuEntry;
  /** Changes whenever `entry` should be applied again to a presented popup. */
  entryKey: number;
  onDismissed(reason: CalloutDismissReason): void;
  /** Called when focus is confirmed anywhere in this popup. */
  onFocusHeld?(): void;
  /** For a submenu: the level that owns it and the row that opened it. */
  parent?: { level: MenuLevel; rowId: string };
  /** For the root popup: the family it creates, plus the style values the style phase resolved. */
  family?: MenuFamilyOptions;
  surfaceStyle?: StyleProp<ViewStyle>;
  gap?: number;
  children: React.ReactNode;
}

/**
 * One popup of a menu family: the native Callout, its surface, the vertical FocusZone, and the policy for the rows it
 * hosts (activation, submenus, hover, Home/End, and type-ahead). The root popup creates the family; each submenu row
 * renders a child popup one level deeper.
 */
export function MenuPopup(props: MenuPopupProps) {
  const { anchorTarget, children, entry, entryKey, level, open, placement, presentationKey, surface, tabNavigation } = props;
  const inherited = React.useContext(MenuFamilyContext);
  const rootFamily = React.useMemo(
    () =>
      props.family && {
        ...props.family,
        rtl: I18nManager.isRTL,
        surfaceStyle: props.surfaceStyle,
        gap: props.gap ?? 0,
      },
    [props.family, props.surfaceStyle, props.gap],
  );
  const family = rootFamily ?? inherited;
  if (!family) {
    throw new Error('MenuPopup requires a menu family.');
  }
  const { host } = family;

  const callout = React.useRef<CalloutHandle>(null);
  const zone = React.useRef<FocusZoneCommands>(null);
  const surfaceTarget = host.useNativeViewTarget();
  const [openChild, setOpenChild] = React.useState<MenuOpenChild | null>(null);

  const latest = React.useRef({ props, family, openChild });
  React.useLayoutEffect(() => {
    latest.current = { props, family, openChild };
  });

  const rows = React.useRef(new Map<string, MenuItemMenuRow>());
  const rowOrder = React.useRef(new Map<string, number>());
  const rowTargets = React.useRef(new Map<string, NativeViewTarget>());
  const presentation = React.useRef<CalloutPresentation | null>(null);
  const focusedRow = React.useRef<string | null>(null);
  const surfaceFocused = React.useRef(false);
  const hoverTimer = React.useRef<{ id: string; handle: ReturnType<typeof setTimeout> } | null>(null);
  const childKey = React.useRef(0);

  const clearHover = React.useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current.handle);
      hoverTimer.current = null;
    }
  }, []);
  const schedule = React.useCallback(
    (id: string, delay: number, action: () => void) => {
      clearHover();
      hoverTimer.current = {
        id,
        handle: setTimeout(() => {
          hoverTimer.current = null;
          action();
        }, delay),
      };
    },
    [clearHover],
  );

  React.useEffect(() => {
    if (!open) {
      setOpenChild(null);
      clearHover();
    }
  }, [open, clearHover]);
  React.useEffect(() => clearHover, [clearHover]);

  const sortedRows = React.useCallback(
    () => Array.from(rows.current.values()).sort((a, b) => (rowOrder.current.get(a.id) ?? 0) - (rowOrder.current.get(b.id) ?? 0)),
    [],
  );

  // Zones that cannot search their own rows, such as Win32's, report the request unsupported; this popup then focuses
  // the edge row itself, and the row's focus reports the held focus.
  const focusEdgeRow = React.useCallback(
    (edge: 'first' | 'last') =>
      zone.current?.requestFocus(edge).then((outcome) => {
        if (outcome.status === 'unsupported') {
          const focusable = sortedRows().filter((row) => row.focusable);
          (edge === 'first' ? focusable[0] : focusable[focusable.length - 1])?.focus();
        }
        return outcome;
      }),
    [sortedRows],
  );

  const restoreRow = React.useCallback((id: string) => {
    // The host already returned focus to this retained row; a request could land after newer arrow-key navigation.
    if (focusedRow.current === id && latest.current.family.host.restoresOwnerFocus) {
      return;
    }
    // A native request also makes this popup key again after its child popup closes.
    const target = rowTargets.current.get(id);
    const current = presentation.current;
    const api = callout.current;
    if (target && current && api && api.getPresentation() === current) {
      void api.requestFocus(current, target);
    } else {
      rows.current.get(id)?.focus();
    }
  }, []);

  const openSubmenu = React.useCallback(
    (id: string, childEntry: MenuEntry) => {
      if (level >= maxSubmenuLevel) {
        if (__DEV__) {
          console.warn(`Menu: submenus nest at most ${maxSubmenuLevel} levels; this submenu does not open.`);
        }
        return;
      }
      childKey.current += 1;
      setOpenChild({ id, entry: childEntry, key: childKey.current });
    },
    [level],
  );

  const focusEntry = React.useCallback(
    (current: CalloutPresentation, mode: MenuEntry) => {
      const api = callout.current;
      if (!api || mode === 'none') {
        return;
      }
      // The FocusZone searches its own rows; a popup-wide search would stop at the zone, which is itself focusable.
      const request = mode === 'surface' ? api.requestFocus(current, surfaceTarget.target) : focusEdgeRow(mode);
      void request?.then(({ status }) => {
        if (status === 'confirmed') {
          latest.current.props.onFocusHeld?.();
        }
      });
    },
    [focusEdgeRow, surfaceTarget],
  );

  const appliedEntryKey = React.useRef(entryKey);
  React.useEffect(() => {
    if (entryKey === appliedEntryKey.current) {
      return;
    }
    appliedEntryKey.current = entryKey;
    const current = presentation.current;
    if (current && callout.current?.getPresentation() === current) {
      focusEntry(current, entry);
    }
  }, [entry, entryKey, focusEntry]);

  const onReady = React.useCallback(
    ({ presentation: current }: { presentation: CalloutPresentation }) => {
      presentation.current = current;
      appliedEntryKey.current = latest.current.props.entryKey;
      focusEntry(current, latest.current.props.entry);
    },
    [focusEntry],
  );
  const onDismissed = React.useCallback(
    ({ reason }: { reason: CalloutDismissReason }) => {
      presentation.current = null;
      focusedRow.current = null;
      surfaceFocused.current = false;
      clearHover();
      setOpenChild(null);
      latest.current.props.onDismissed(reason);
    },
    [clearHover],
  );

  const handleNavigationKey = React.useCallback(
    (currentId: string | null, event: FocusKeyboardEvent) => {
      const native = event.nativeEvent;
      if (native.altKey || native.ctrlKey || native.metaKey) {
        return false;
      }
      if (native.key === 'Home' || native.key === 'End') {
        void focusEdgeRow(native.key === 'Home' ? 'first' : 'last');
        return true;
      }
      const character = getTypeAheadCharacter(native);
      if (character) {
        findTypeAheadRow(sortedRows(), currentId, character)?.focus();
        return true;
      }
      return false;
    },
    [focusEdgeRow, sortedRows],
  );

  const binding = React.useMemo<MenuItemMenuBinding>(
    () => ({
      disabledFocusable: family.disabledFocusable,
      SubmenuRow: family.SubmenuRow,
      register: (row) => {
        if (!rowOrder.current.has(row.id)) {
          rowOrder.current.set(row.id, rowOrder.current.size);
        }
        rows.current.set(row.id, row);
        return () => {
          if (rows.current.get(row.id) === row) {
            rows.current.delete(row.id);
          }
        };
      },
      isSubmenuOpen: (id) => openChild?.id === id,
      onRowPress: (id, keyboard) => {
        const row = rows.current.get(id);
        if (!row?.hasSubmenu) {
          latest.current.family.closeFamily();
          return;
        }
        clearHover();
        if (latest.current.openChild?.id === id) {
          setOpenChild(null);
        } else {
          openSubmenu(id, keyboard ? 'first' : 'none');
        }
      },
      onRowFocus: (id) => {
        focusedRow.current = id;
        latest.current.props.parent?.level.cancelHover();
        latest.current.props.onFocusHeld?.();
      },
      onRowBlur: (id) => {
        if (focusedRow.current === id) {
          focusedRow.current = null;
        }
      },
      onRowHoverIn: (id) => {
        latest.current.props.parent?.level.cancelHover();
        const { hover } = latest.current.family;
        const row = rows.current.get(id);
        if (!row) {
          return;
        }
        // Hot tracking: while this popup holds keyboard focus, the hovered row becomes the focused row.
        if ((focusedRow.current !== null || surfaceFocused.current) && focusedRow.current !== id && row.focusable) {
          row.focus();
        }
        if (!hover.enabled) {
          return;
        }
        const current = latest.current.openChild;
        if (current?.id === id) {
          clearHover();
        } else if (hoverTimer.current?.id === id) {
          // A repeated enter keeps the change this row already scheduled.
        } else if (current) {
          schedule(id, hover.closeDelay, () => (row.hasSubmenu ? openSubmenu(id, 'none') : setOpenChild(null)));
        } else if (row.hasSubmenu) {
          schedule(id, hover.openDelay, () => openSubmenu(id, 'none'));
        }
      },
      onRowHoverOut: (id) => {
        if (hoverTimer.current?.id === id && latest.current.family.host.reportsPointerLeave) {
          clearHover();
        }
      },
      onRowKeyDown: (id, event) => {
        const native = event.nativeEvent;
        const arrows = getInlineArrows(latest.current.family.rtl);
        if (native.key === arrows.open && !native.altKey && !native.ctrlKey && !native.metaKey) {
          if (rows.current.get(id)?.hasSubmenu) {
            openSubmenu(id, 'first');
          }
          return;
        }
        if (native.key === arrows.close) {
          const parent = latest.current.props.parent;
          if (!parent) {
            return;
          }
          // Restore the opener row only after this popup has closed, so its owner popup can become key again.
          const api = callout.current;
          const current = presentation.current;
          const closeAndRestore = () => parent.level.closeChild(parent.rowId, true);
          if (api && current) {
            void api.close(current).then(closeAndRestore);
          } else {
            closeAndRestore();
          }
          return;
        }
        handleNavigationKey(id, event);
      },
    }),
    [family, openChild, clearHover, schedule, openSubmenu, handleNavigationKey],
  );

  const levelApi = React.useMemo<MenuLevel>(
    () => ({
      level,
      openChild,
      setRowTarget: (id, target) => {
        if (target) {
          rowTargets.current.set(id, target);
        } else {
          rowTargets.current.delete(id);
        }
      },
      onChildDismissed: (id, reason) => {
        setOpenChild((current) => (current?.id === id ? null : current));
        if (reason === 'escape') {
          restoreRow(id);
        }
      },
      closeChild: (id, restore) => {
        setOpenChild((current) => (current?.id === id ? null : current));
        if (restore) {
          restoreRow(id);
        }
      },
      cancelHover: clearHover,
    }),
    [level, openChild, restoreRow, clearHover],
  );

  const { ref: surfaceRef, style: surfaceUserStyle, onFocus, onBlur, onKeyDown, keyDownEvents, ...surfaceProps } = surface ?? {};
  const content = {
    accessible: true,
    role: 'menu' as const,
    accessibilityLabel: surfaceProps.accessibilityLabel ?? props.label,
    ...surfaceProps,
    enableFocusRing: false,
    focusable: entry === 'surface' || surfaceProps.focusable === true,
    keyDownEvents: [...(keyDownEvents ?? []), ...surfaceKeys],
    ref: composeRefs<React.ComponentRef<typeof View>>(surfaceRef, surfaceTarget.ref),
    style: [family.surfaceStyle, surfaceUserStyle],
    onFocus: (event: NativeSyntheticEvent<TargetedEvent>) => {
      surfaceFocused.current = true;
      onFocus?.(event);
    },
    onBlur: (event: NativeSyntheticEvent<TargetedEvent>) => {
      surfaceFocused.current = false;
      onBlur?.(event);
    },
    onKeyDown: (event: FocusKeyboardEvent) => {
      onKeyDown?.(event);
      // Rows handle their own keys; the surface acts only while it holds focus itself after a pointer open.
      if (focusedRow.current !== null || !surfaceFocused.current) {
        return;
      }
      const key = event.nativeEvent.key;
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        void focusEdgeRow(key === 'ArrowDown' ? 'first' : 'last');
      } else {
        handleNavigationKey(null, event);
      }
    },
  };

  // Menu requests every entry focus itself, so a submenu that hover opens leaves focus in its owner popup.
  const { ExplicitFocusCallout: Callout, FocusZone } = host;
  return (
    <MenuFamilyContext.Provider value={family}>
      <MenuLevelContext.Provider value={levelApi}>
        <MenuItemMenuContext.Provider value={binding}>
          <View pointerEvents="box-none" style={popupLayoutStyles.host}>
            <Callout
              ref={callout}
              open={open}
              presentationKey={presentationKey}
              anchor={{ kind: 'view', target: anchorTarget }}
              placement={{ ...placement, gap: family.gap }}
              tabNavigation={tabNavigation}
              content={content}
              onReady={onReady}
              onDismissed={onDismissed}
            >
              <RootInputBoundary style={popupLayoutStyles.fit}>
                <FocusZone commandsRef={zone} direction="vertical" arrowBoundary="wrap">
                  {children}
                </FocusZone>
              </RootInputBoundary>
            </Callout>
          </View>
        </MenuItemMenuContext.Provider>
      </MenuLevelContext.Provider>
    </MenuFamilyContext.Provider>
  );
}
