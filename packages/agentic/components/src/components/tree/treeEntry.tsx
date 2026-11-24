import { useLayoutEffect } from 'react';
import { renderTreeItem_unstable } from '../tree-item/renderTreeItem';
import type { TreeItemBranchState, TreeItemLeafState } from '../tree-item/tree-item.types';
import { useTreeItem } from '../tree-item/useTreeItem';
import { useTreeItemStyles_unstable } from '../tree-item/useTreeItemStyles';
import type { TreeState } from './tree.types';

export function TreeEntry({ value, state }: { value: string; state: TreeState }) {
  const { entry, level, position, setSize, children } = state.nodes.get(value)!;
  const { register, getProps } = state.focus;
  const { focusable, ...input } = getProps(value);
  const behavior: TreeItemBranchState | TreeItemLeafState = entry.children
    ? {
        expanded: state.open.has(value),
        onExpandedChange: (open) => state.setOpen(value, open),
        children: state.open.has(value) ? children.map((key) => <TreeEntry key={key} value={key} state={state} />) : undefined,
      }
    : { onActivate: state.activate };
  const selection =
    state.selectionMode === 'multiple'
      ? { checked: state.checked.get(value) ?? false }
      : state.selectionMode === 'single'
        ? { selected: state.selected.has(value) }
        : {};
  const row = useTreeItem(
    {
      ...state.renderItem?.(entry),
      ...behavior,
      ...selection,
      value,
      label: entry.label,
      disabled: entry.disabled,
      primaryTestID: entry.testID,
      appearance: state.appearance,
      layout: state.layout,
      size: state.itemSize,
      level,
      position,
      setSize,
      focusable,
      onSelection: state.selectionMode === 'none' ? undefined : state.select,
    },
    input,
  );
  useLayoutEffect(() => register(value, row.focusTarget), [value, register, row.focusTarget]);
  useTreeItemStyles_unstable(row);
  return renderTreeItem_unstable(row);
}
