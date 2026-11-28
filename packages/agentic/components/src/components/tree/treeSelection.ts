import type { HierarchyNode } from '../../common/keyedHierarchy';
import type { TreeItemChecked } from '../tree-item/tree-item.types';
import type { TreeNode } from './tree.types';

export function eligibleLeaves(nodes: ReadonlyMap<string, HierarchyNode<TreeNode>>, key: string): string[] {
  const pending = [key];
  const result: string[] = [];
  while (pending.length) {
    const node = nodes.get(pending.pop()!);
    if (!node || node.entry.disabled) continue;
    if (!node.children.length) result.push(node.key);
    else for (let index = node.children.length - 1; index >= 0; index--) pending.push(node.children[index]);
  }
  return result;
}

export function normalizeTreeSelection(nodes: ReadonlyMap<string, HierarchyNode<TreeNode>>, keys: readonly string[]): Set<string> {
  const result = new Set<string>();
  for (const key of keys) {
    const node = nodes.get(key);
    if (!node) continue;
    if (!node.children.length) result.add(key);
    else for (const leaf of eligibleLeaves(nodes, key)) result.add(leaf);
  }
  return result;
}

export function treeChecks(nodes: ReadonlyMap<string, HierarchyNode<TreeNode>>, selected: ReadonlySet<string>) {
  const counts = new Map<string, { selected: number; total: number }>();
  const checks = new Map<string, TreeItemChecked>();
  for (const [key, node] of [...nodes].reverse()) {
    let count = counts.get(key);
    if (!count) {
      count = { selected: !node.children.length && selected.has(key) ? 1 : 0, total: node.children.length ? 0 : 1 };
    }
    const checked: TreeItemChecked = count.total === 0 || count.selected === 0 ? false : count.selected === count.total ? true : 'mixed';
    checks.set(key, checked);
    if (node.parent !== undefined && !node.entry.disabled) {
      const parent = counts.get(node.parent) ?? { selected: 0, total: 0 };
      parent.selected += count.selected;
      parent.total += count.total;
      counts.set(node.parent, parent);
    }
  }
  return checks;
}
