import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useControllableValue, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { desktopControls } from '../../common/desktopControls';
import { buildHierarchy, hierarchyAncestors, visibleHierarchy } from '../../common/keyedHierarchy';
import { usePanelFocus } from '../../common/usePanelFocus';
import { Dialog } from '../dialog/dialog';
import type { NavProps, NavState } from './nav.types';

export function useNav_unstable({
  items,
  currentValue,
  currentDescription,
  onNavigate,
  expandedKeys,
  defaultExpandedKeys = [],
  onExpandedChange,
  presentation = 'inline',
  density = 'comfortable',
  open,
  defaultOpen,
  onOpenChange,
  openerRef,
  accessibilityLabel,
  closeLabel,
  header,
  footer,
  style: userStyle,
  ...rootProps
}: NavProps): NavState {
  if (presentation === 'overlay' && !desktopControls?.DialogWindow) {
    throw new Error('Nav overlay requires a qualified native DialogWindow host.');
  }
  const graph = useMemo(
    () =>
      buildHierarchy(
        items,
        (entry) => entry.key,
        (entry) => entry.children,
      ),
    [items],
  );
  const [expansion, setExpansion] = useControllableValue<readonly string[]>(expandedKeys, defaultExpandedKeys);
  const expanded = new Set<string>((expansion ?? []).filter((key) => graph.nodes.get(key)?.entry.type === 'category'));
  const [shown, setShown] = useControllableValue<boolean>(open, defaultOpen ?? presentation === 'inline');
  const rows = visibleHierarchy(graph, expanded);
  const visible = new Set<string>(shown ? rows.map((row) => row.key) : []);
  const focus = usePanelFocus(visible, presentation === 'inline' ? openerRef : undefined, (key) =>
    hierarchyAncestors(graph.nodes, key).find((parent) => visible.has(parent)),
  );
  const currentAncestors = new Set(hierarchyAncestors(graph.nodes, currentValue));
  const setOpen = (next: boolean) => {
    if (next === shown) return;
    setShown(next);
    onOpenChange?.(next);
  };
  useAccessibilityLabelWarning({
    componentName: 'Nav',
    accessibilityLabel: accessibilityLabel.trim() ? accessibilityLabel : undefined,
    requireLabel: true,
    warning: 'Nav: provide a localized navigation name.',
  });
  return {
    ...useThemeState(),
    open: shown ?? false,
    presentation,
    density,
    rows,
    expanded,
    currentValue,
    currentDescription,
    currentAncestors,
    select: onNavigate,
    expand(key, next) {
      const candidate = graph.nodes.get(key)?.entry;
      if (!candidate || candidate.type !== 'category' || candidate.disabled || next === expanded.has(key)) return;
      const keys = next ? [...expanded, key] : [...expanded].filter((value) => value !== key);
      setExpansion(keys);
      onExpandedChange?.(keys, { key });
    },
    focus,
    headerContent: header,
    footerContent: footer,
    userStyle,
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false, collapsable: false }),
    overlay: useOptionalSlot(
      Dialog,
      presentation === 'overlay'
        ? {
            open: shown ?? false,
            title: accessibilityLabel,
            closeLabel,
            triggerRef: openerRef,
            onOpenChange: setOpen,
          }
        : null,
    ),
    panel: useSlot(View, { accessible: true, role: 'navigation', accessibilityLabel, focusable: false }),
    header: useOptionalSlot(View, header != null ? {} : null),
    body: useSlot(ScrollView, { keyboardShouldPersistTaps: 'handled' }),
    footer: useOptionalSlot(View, footer != null ? {} : null),
  };
}
