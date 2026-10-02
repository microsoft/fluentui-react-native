import * as React from 'react';
import { I18nManager, Platform } from 'react-native';
import type { View } from 'react-native';
import { isSelfTargetEvent, resolveAccessibilityAction, useSlot, useToggleState } from '@fluentui-react-native/framework-base';
import { useMenuItem_unstable } from '../menu-item/useMenuItem';
import type { PopoverCommittedAnchor } from '../popover/popover.types';
import type { MenuActionEvent, MenuEntryProps, MenuEntryState } from './menu-entry.types';
import { MenuContext } from './MenuContext';
import { menuNavigationKeyProps } from './menu.keyboard';
import { getMenuEntryError } from './menu.children';
import { assertMenuPlatform } from './menu.platform';

export function useMenuEntry_unstable(props: MenuEntryProps): MenuEntryState {
  assertMenuPlatform();
  const scope = React.useContext(MenuContext);
  if (!scope) throw new Error('MenuEntry requires a macOS Menu owner.');
  const error = getMenuEntryError(props, scope.depth);
  if (error) throw new Error(`MenuEntry "${props.itemId}": ${error}.`);
  const originalId = React.useRef(props.itemId);
  if (originalId.current !== props.itemId)
    throw new Error('MenuEntry itemId must remain stable; mount a keyed replacement for a different command.');
  const {
    itemId,
    textValue: _textValue,
    checkable,
    selectionGroup: _selectionGroup,
    submenu,
    submenuOpen,
    defaultSubmenuOpen = false,
    onSubmenuOpenChange,
    onAction,
    onPress,
    onKeyDown,
    onKeyUp,
    onFocus,
    onBlur,
    onHoverIn,
    onHoverOut,
    accessibilityActions,
    onAccessibilityAction,
    onAccessibilityTap,
    accessibilityState,
    ...leafProps
  } = props;
  const nativeRef = React.useRef<View | null>(null);
  const scopeState = React.useSyncExternalStore(scope.subscribe, scope.getSnapshot, scope.getSnapshot);
  const [anchor, setAnchor] = React.useState<PopoverCommittedAnchor | null>(null);
  const expansion = useToggleState({ value: submenuOpen, defaultValue: defaultSubmenuOpen, onChange: onSubmenuOpenChange });
  const requestedOpen = Boolean(submenu && expansion.value);
  const open = requestedOpen && scopeState.branchId === itemId;
  const latestExpansion = React.useRef(expansion);
  latestExpansion.current = expansion;
  const requestSubmenu = React.useCallback(
    (next: boolean) => {
      // Disabling must not suppress cleanup of an existing branch.
      if (!next || !props.disabled) latestExpansion.current.setValue(next);
    },
    [props.disabled],
  );
  let actions = accessibilityActions;
  let ownedAction: string | undefined;
  let collapseAction: string | undefined;
  if (checkable) {
    const resolved = resolveAccessibilityAction(checkable === 'radio' ? 'select' : 'toggle', Platform.OS, actions);
    actions = resolved.accessibilityActions;
    ownedAction = resolved.name;
  } else if (submenu) {
    const expand = resolveAccessibilityAction('expand', Platform.OS, actions);
    const collapse = resolveAccessibilityAction('collapse', Platform.OS, expand.accessibilityActions);
    actions = collapse.accessibilityActions;
    ownedAction = expand.name;
    collapseAction = collapse.name;
  }
  const act = (event?: MenuActionEvent) => {
    onAction?.(event);
  };
  const leafInput = {
    ...leafProps,
    ...menuNavigationKeyProps,
    menuStyle: 'list-item',
    hasMultiselect: checkable === 'checkbox',
    hasCheckmark: checkable === 'radio',
    hasChevron: Boolean(submenu),
    accessibilityActions: actions,
    accessibilityState: { ...accessibilityState, ...(submenu ? { expanded: open } : {}) },
    onPress: (event: Parameters<NonNullable<MenuEntryProps['onPress']>>[0]) => {
      if (props.disabled) return;
      if (!scope.canInvoke(itemId)) {
        onPress?.(event);
        return;
      }
      if (submenu) {
        void scope.openSubmenu(itemId).catch((reason: unknown) => console.error('Menu submenu activation failed.', reason));
        onPress?.(event);
      } else {
        act(event);
        onPress?.(event);
        scope.action();
      }
    },
    onAccessibilityAction: (event: Parameters<NonNullable<MenuEntryProps['onAccessibilityAction']>>[0]) => {
      const owned = event.nativeEvent.actionName === ownedAction || event.nativeEvent.actionName === collapseAction;
      if (!props.disabled && owned && scope.canInvoke(itemId)) {
        if (event.nativeEvent.actionName === ownedAction) {
          if (submenu) {
            void scope.openSubmenu(itemId).catch((reason: unknown) => console.error('Menu submenu expansion failed.', reason));
          } else {
            act(event);
            onAccessibilityAction?.(event);
            scope.action();
            return;
          }
        } else if (event.nativeEvent.actionName === collapseAction && submenu && open) {
          void scope.closeBranch().catch((reason: unknown) => console.error('Menu submenu collapse failed.', reason));
        }
      }
      onAccessibilityAction?.(event);
    },
    onAccessibilityTap: () => {
      if (!props.disabled && scope.canInvoke(itemId)) {
        if (submenu) {
          void scope.openSubmenu(itemId).catch((reason: unknown) => console.error('Menu submenu AX activation failed.', reason));
        } else {
          act(undefined);
          onAccessibilityTap?.();
          scope.action();
          return;
        }
      }
      onAccessibilityTap?.();
    },
    onKeyDown: (event: import('@fluentui-react-native/framework-base').FocusKeyboardEvent) => {
      onKeyDown?.(event);
      if (!props.disabled && isSelfTargetEvent(event)) scope.key(itemId, event, I18nManager.isRTL);
    },
    onKeyUp,
    onFocus: (event: Parameters<NonNullable<MenuEntryProps['onFocus']>>[0]) => {
      if (isSelfTargetEvent(event)) scope.focus(itemId);
      onFocus?.(event);
    },
    onBlur,
    onHoverIn,
    onHoverOut,
  };
  const state = useMenuItem_unstable({ ...leafInput, menuStyle: 'list-item' });
  const target = state.focusTarget;
  const refEpoch = React.useRef(0);
  const rowRef = React.useCallback<React.RefCallback<View>>((instance) => {
    const epoch = ++refEpoch.current;
    nativeRef.current = instance;
    const clear = () => {
      if (refEpoch.current !== epoch) return;
      nativeRef.current = null;
      queueMicrotask(() => {
        if (mounted.current && refEpoch.current === epoch && !nativeRef.current) setAnchor(null);
      });
    };
    if (!instance) {
      clear();
      return undefined;
    }
    return clear;
  }, []);
  const generation = target.generation;
  const mounted = React.useRef(false);
  React.useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  React.useLayoutEffect(() => {
    const current = nativeRef.current;
    if (current && target.current === current) {
      setAnchor((previous) =>
        previous?.nativeRef.current === current && previous.mountGeneration === target.generation
          ? previous
          : { nativeRef, mountGeneration: target.generation, lifetime: target },
      );
    }
  }, [target, generation]);
  React.useLayoutEffect(() => scope.register(itemId, { target, nativeRef, requestSubmenu }), [scope, itemId, target, requestSubmenu]);
  React.useLayoutEffect(() => {
    scope.expanded(itemId, requestedOpen);
    // All changed layout-effect cleanups run before sibling setups in the same commit.
    return () => scope.expanded(itemId, false);
  }, [scope, itemId, requestedOpen]);
  // The nested callable slot composes this native witness with public and focus refs.
  state.root = useSlot(state.root, { ref: rowRef });
  return { ...state, itemId, scope, rowRef, submenu, submenuOpen: open, requestSubmenu, anchor: scopeState.hasPresented ? anchor : null };
}
