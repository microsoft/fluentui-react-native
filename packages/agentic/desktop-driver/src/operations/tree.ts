import type { NativeObservedNode } from '../host/types.js';

/** The parent index of every node in a sample, `-1` for the root. Parents precede their children in a sample. */
export function indexParents(nodes: readonly NativeObservedNode[]): number[] {
  const parent = Array.from({ length: nodes.length }, () => -1);
  const byId = new Map<string, number>();
  for (const [index, node] of nodes.entries()) {
    byId.set(node.id, index);
    const parentIndex = node.parentId === undefined ? undefined : byId.get(node.parentId);
    if (parentIndex !== undefined) {
      parent[index] = parentIndex;
    }
  }
  return parent;
}

/**
 * Pre-order over the original tree, writing only the chosen nodes. Walking the original tree keeps document order when
 * nodes are elided: a node can move up to a nearer kept ancestor yet stays among its true siblings.
 */
export function inDocumentOrder(chosen: readonly number[], parent: readonly number[]): number[] {
  const isChosen = Array.from({ length: parent.length }, () => false);
  for (const index of chosen) {
    isChosen[index] = true;
  }
  const children: number[][] = Array.from({ length: parent.length }, () => []);
  const roots: number[] = [];
  for (const [index, parentIndex] of parent.entries()) {
    if (parentIndex < 0) {
      roots.push(index);
    } else {
      children[parentIndex].push(index);
    }
  }
  const sequence: number[] = [];
  const stack = roots.slice().reverse();
  while (stack.length > 0) {
    const index = stack.pop();
    if (isChosen[index]) {
      sequence.push(index);
    }
    const below = children[index];
    for (let position = below.length - 1; position >= 0; position -= 1) {
      stack.push(below[position]);
    }
  }
  return sequence;
}
