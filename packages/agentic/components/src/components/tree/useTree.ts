import { useLayoutEffect, useMemo, useRef } from 'react';
import { I18nManager, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useControllableValue, useSlot } from '@fluentui-react-native/framework-base';
import { chooseAdjacentKey } from '../../common/keyedCollection';
import { buildHierarchy, hierarchyAncestors, visibleHierarchy } from '../../common/keyedHierarchy';
import { useKeyedFocus } from '../../common/useKeyedFocus';
import type { TreeProps, TreeState } from './tree.types';
import { eligibleLeaves, normalizeTreeSelection, treeChecks } from './treeSelection';

export function useTree_unstable({
  items,
  renderItem,
  openItems,
  defaultOpenItems = [],
  onOpenChange,
  selectionMode = 'none',
  selectedKeys,
  defaultSelectedKeys = [],
  onSelectionChange,
  onActivate,
  appearance = 'subtle',
  size = 'medium',
  layout = selectionMode === 'multiple' ? 'checkbox' : 'standard',
  accessibilityLabel,
  style: userStyle,
  ...rootProps
}: TreeProps): TreeState {
  const graph = useMemo(
    () =>
      buildHierarchy(
        items,
        (entry) => entry.key,
        (entry) => entry.children,
      ),
    [items],
  );
  const [expansion, setExpansion] = useControllableValue<readonly string[]>(openItems, defaultOpenItems);
  const [keys, setKeys] = useControllableValue<readonly string[]>(selectedKeys, defaultSelectedKeys);
  const open = new Set<string>((expansion ?? []).filter((key) => !!graph.nodes.get(key)?.entry.children));
  const single = (keys ?? []).find((key) => graph.nodes.has(key));
  const selected =
    selectionMode === 'multiple'
      ? normalizeTreeSelection(graph.nodes, keys ?? [])
      : new Set<string>(selectionMode === 'single' && single !== undefined ? [single] : []);
  const checked = selectionMode === 'multiple' ? treeChecks(graph.nodes, selected) : new Map();
  const rows = visibleHierarchy(graph, open);
  const visible = new Set(rows.filter((row) => !row.entry.disabled).map((row) => row.key));
  const previous = useRef({ graph, rows });
  const typeAhead = useRef({ text: '', last: 0 });

  const setOpen = (key: string, next: boolean) => {
    const entry = graph.nodes.get(key)?.entry;
    if (!entry?.children || entry.disabled || next === open.has(key)) return;
    const nextKeys = next ? [...open, key] : [...open].filter((value) => value !== key);
    setExpansion(nextKeys);
    onOpenChange?.(nextKeys, { key });
  };
  const select = (key: string) => {
    if (selectionMode === 'none' || !visible.has(key)) return;
    if (selectionMode === 'single' && selected.has(key)) return;
    let next: string[];
    if (selectionMode === 'single') {
      next = [key];
    } else {
      const leaves = eligibleLeaves(graph.nodes, key);
      if (!leaves.length) return;
      const clear = leaves.every((leaf) => selected.has(leaf));
      const changed = new Set(selected);
      for (const leaf of leaves) {
        if (clear) changed.delete(leaf);
        else changed.add(leaf);
      }
      next = [...changed];
    }
    setKeys(next);
    onSelectionChange?.(next, { key });
  };

  const towardChild = I18nManager.isRTL ? 'ArrowLeft' : 'ArrowRight';
  const towardParent = I18nManager.isRTL ? 'ArrowRight' : 'ArrowLeft';
  const focus: TreeState['focus'] = useKeyedFocus(
    rows.map((row) => ({ value: row.key, disabled: row.entry.disabled })),
    {
      mode: 'vertical',
      remember: true,
      extraKeys: [towardChild, towardParent],
      recoverValue: (key) =>
        hierarchyAncestors(previous.current.graph.nodes, key).find((parent) => visible.has(parent)) ??
        chooseAdjacentKey(
          key,
          previous.current.rows.map((row) => row.key),
          visible,
        ),
      onOtherKey: (key, nativeKey) => {
        const row = graph.nodes.get(key);
        if (!row) return false;
        if (nativeKey === towardChild) {
          if (row.children.length && !open.has(key)) setOpen(key, true);
          else {
            const child = row.children.find((candidate) => visible.has(candidate));
            if (child) focus.requestFocus(child, 'keyboard');
          }
          return true;
        }
        if (nativeKey === towardParent) {
          if (open.has(key)) setOpen(key, false);
          else {
            const parent = hierarchyAncestors(graph.nodes, key).find((candidate) => visible.has(candidate));
            if (parent) focus.requestFocus(parent, 'keyboard');
          }
          return true;
        }
        if ([...nativeKey].length !== 1 || !nativeKey.trim()) return false;
        const letter = nativeKey.toLocaleLowerCase();
        const time = Date.now();
        const prior = typeAhead.current;
        const query = time - prior.last > 600 || prior.text === letter ? letter : prior.text + letter;
        typeAhead.current = { text: query, last: time };
        const start = rows.findIndex((entry) => entry.key === key);
        for (let index = 1; index <= rows.length; index++) {
          const candidate = rows[(start + index) % rows.length];
          if (visible.has(candidate.key) && candidate.entry.label.toLocaleLowerCase().startsWith(query)) {
            focus.requestFocus(candidate.key, 'keyboard');
            return true;
          }
        }
        return true;
      },
    },
  );
  useLayoutEffect(() => {
    previous.current = { graph, rows };
  }, [graph, rows]);
  useAccessibilityLabelWarning({
    componentName: 'Tree',
    accessibilityLabel: accessibilityLabel.trim() ? accessibilityLabel : undefined,
    requireLabel: true,
    warning: 'Tree: provide a localized tree name.',
  });
  const accessibilityState = selectionMode === 'multiple' ? { multiselectable: true } : undefined;
  return {
    ...useThemeState(),
    ...graph,
    renderItem,
    selectionMode,
    open,
    selected,
    checked,
    focus,
    size,
    itemSize: size,
    layout,
    appearance,
    userStyle,
    setOpen,
    select,
    activate: onActivate,
    root: useSlot(View, { ...rootProps, accessible: true, role: 'tree', accessibilityLabel, accessibilityState, focusable: false }),
  };
}
