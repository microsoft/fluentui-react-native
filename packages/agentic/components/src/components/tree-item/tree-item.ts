import { renderTreeItem_unstable } from './renderTreeItem';
import type { TreeItemProps } from './tree-item.types';
import { useTreeItem_unstable } from './useTreeItem';
import { useTreeItemStyles_unstable } from './useTreeItemStyles';

export const TreeItem = (props: TreeItemProps) => {
  const state = useTreeItem_unstable(props);
  useTreeItemStyles_unstable(state);
  return renderTreeItem_unstable(state);
};
TreeItem.displayName = 'TreeItem';
