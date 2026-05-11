import type { RenderNode, SlotPath } from '../types.ts';

/**
 * Visitor callback invoked for each `RenderNode` reached by `walkTree`.
 *
 * @param node the current node
 * @param path the chain of child indices from the root, e.g. `[]` for
 *   the root, `[0]` for its first child, `[0, 1]` for the second child
 *   of the first child, etc.
 */
export type RenderNodeVisitor = (node: RenderNode, path: SlotPath) => void;

/**
 * Depth-first, pre-order walk over a `RenderNode` tree.
 *
 * - Visits `root` first, then each child that is itself a `RenderNode`,
 *   skipping string children (text content).
 * - The `path` passed to `visit` is built from child indices: `[]` at
 *   root, `[0]` at the first child, `[0, 1]` deeper, and so on. Index
 *   positions correspond to the original `children` array, so string
 *   children still consume an index even though they are not visited.
 *
 * The walker has no dependencies and never mutates the tree — it's a
 * shared building block for the theme, a11y, and component analyzers.
 */
export function walkTree(root: RenderNode, visit: RenderNodeVisitor): void {
  walk(root, [], visit);
}

function walk(node: RenderNode, path: SlotPath, visit: RenderNodeVisitor): void {
  visit(node, path);
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (typeof child === 'string') {
      continue;
    }
    walk(child, [...path, i], visit);
  }
}
