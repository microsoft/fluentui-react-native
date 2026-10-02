import * as React from 'react';
import { findNodeHandle, I18nManager } from 'react-native';
import { useControllableValue } from '@fluentui-react-native/framework-base';
import { useRootSettings } from '@fluentui-react-native/design';
import type { PopoverCommittedAnchor, PopoverMenuHostBinding, PopoverMenuHostOptions } from '../popover/popover.types';
import { usePopover_unstable } from '../popover/usePopover';
import { createMenuScope } from './menu.controller';
import type { MenuScope } from './menu.controller';
import type { MenuProps, MenuState } from './menu.types';
import { getMenuInventory } from './menu.children';
import { assertMenuPlatform } from './menu.platform';

export type MenuExternalOptions = {
  parent: MenuScope;
  itemId: string;
  attachment: PopoverCommittedAnchor | null;
};

function useMenuSettings(props: MenuProps, external?: MenuExternalOptions) {
  assertMenuPlatform();
  if (
    [
      'children',
      'root',
      'role',
      'accessibilityRole',
      'accessible',
      'focusable',
      'surface',
      'surfaceContent',
      'menuFocusManagement',
      'onRestoreFocus',
      'initialFocus',
      'returnFocus',
    ].some((key) => Object.hasOwn(props, key))
  ) {
    throw new Error('Menu cannot expose or override owned roots, native popup transport, or focus policy.');
  }
  for (const name of ['open', 'defaultOpen', 'disabled'] as const) {
    if (props[name] !== undefined && typeof props[name] !== 'boolean') throw new Error(`Menu ${name} must be a boolean.`);
  }
  const contentKeys = ['children', 'ref', 'style', 'testID', 'onLayout', 'onTouchStart', 'onTouchEnd'];
  if (
    props.content != null &&
    (typeof props.content !== 'object' ||
      React.isValidElement(props.content) ||
      Object.keys(props.content).some((key) => !contentKeys.includes(key)))
  ) {
    throw new Error('Menu content must be a narrowed View props object without as, roles or keyboard ownership overrides.');
  }
  if (
    props.trigger &&
    [
      'as',
      'role',
      'accessibilityRole',
      'accessible',
      'focusable',
      'disabled',
      'accessibilityState',
      'aria-expanded',
      'aria-disabled',
      'keyDownEvents',
      'keyUpEvents',
      'validKeysDown',
      'validKeysUp',
    ].some((key) => Object.hasOwn(props.trigger, key))
  ) {
    throw new Error('Menu trigger presentation cannot override its owned native behavior.');
  }
  const { content, trigger: _trigger, open: controlled, defaultOpen = false, onOpenChange, ...rest } = props;
  const depth = external ? external.parent.depth + 1 : 0;
  if (depth > 2) throw new Error('Menu supports only two descendant submenu levels.');
  if (typeof props.surfaceAccessibilityLabel !== 'string' || !props.surfaceAccessibilityLabel.trim())
    throw new Error('Menu requires a nonempty surfaceAccessibilityLabel.');
  const items = React.useMemo(() => getMenuInventory(content?.children, depth), [content?.children, depth]);
  const [scope] = React.useState(() => createMenuScope(depth, external?.parent, findNodeHandle));
  const rootSettings = useRootSettings();
  const [openValue, setOpen] = useControllableValue(controlled, defaultOpen, onOpenChange);
  const open = Boolean(openValue);
  const [presentationKey, newPresentation] = React.useReducer((key: number) => key + 1, 0);
  const latestOpen = React.useRef(open);
  latestOpen.current = open;
  const [hidden, setHidden] = React.useState(false);
  const requestOpen = React.useCallback(
    (next: boolean) => {
      if (!next) external?.parent.expanded(external.itemId, false);
      if (next && hidden) {
        setHidden(false);
        newPresentation();
      }
      if (latestOpen.current === next) return;
      if (controlled === undefined) latestOpen.current = next;
      setOpen(next);
    },
    [controlled, setOpen, hidden, external?.parent, external?.itemId],
  );
  const bindingEpoch = React.useRef(0);
  const bindingRef = React.useCallback(
    (binding: PopoverMenuHostBinding | null) => {
      const epoch = ++bindingEpoch.current;
      scope.setBinding(binding);
      return () => {
        if (bindingEpoch.current === epoch) scope.setBinding(null);
      };
    },
    [scope],
  );
  const host: PopoverMenuHostOptions = {
    policy: 'menu-macos',
    initialFocus: 'owner',
    presentationKey,
    bindingRef,
    onReady: (event, binding) => {
      setHidden(false);
      if (!external) scope.family.keyboard = rootSettings.inputModality === 'keyboard';
      scope.ready(binding, event.nativeEvent.generation);
    },
    onDismissContext: () => {
      setHidden(true);
      scope.dismissed();
    },
    onPointerMove: (event, binding) => scope.pointer(event, binding),
  };
  const popoverProps = {
    ...rest,
    content: { ...content, children: content?.children ?? null },
    open,
    onOpenChange: requestOpen,
    position: props.position ?? (external ? (I18nManager.isRTL ? 'leftTopEdge' : 'rightTopEdge') : 'bottomLeftEdge'),
  };
  React.useLayoutEffect(() => scope.mount(), [scope]);
  React.useLayoutEffect(() => {
    scope.configure(items);
  }, [scope, items]);
  React.useLayoutEffect(() => external?.parent.attachChild(external.itemId, scope), [external?.parent, external?.itemId, scope]);
  React.useLayoutEffect(() => {
    if (!open) {
      scope.dismissed();
      setHidden(false);
    }
  }, [scope, open]);
  const activateTrigger = () => {
    if (!props.disabled) requestOpen(!latestOpen.current);
  };
  return { popoverProps, host, scope, requestedOpen: open, activateTrigger };
}

export function useMenuSurface(props: MenuProps, external: MenuExternalOptions): MenuState {
  const { popoverProps, host, scope, requestedOpen } = useMenuSettings(props, external);
  const state = usePopover_unstable(popoverProps, {
    host,
    anchor: { mode: 'external', attachment: external.attachment },
  });
  return { ...state, scope, requestedOpen, contentUserStyle: props.content?.style };
}

export function useMenu_unstable(props: MenuProps): MenuState {
  assertMenuPlatform();
  const { popoverProps, host, scope, requestedOpen, activateTrigger } = useMenuSettings(props);
  const state = usePopover_unstable(
    {
      ...popoverProps,
      trigger: {
        ...props.trigger,
        onAccessibilityTap: () => {
          activateTrigger();
          props.trigger?.onAccessibilityTap?.();
        },
      },
    },
    { host, anchor: { mode: 'trigger' } },
  );
  return { ...state, scope, requestedOpen, contentUserStyle: props.content?.style };
}
