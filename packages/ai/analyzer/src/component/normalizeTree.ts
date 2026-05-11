import type { RenderNode } from '../types.ts';

/**
 * Loose shape of `react-test-renderer`'s `toJSON()` output. We model it
 * here rather than importing the type from `react-test-renderer` so the
 * analyzer remains a thin layer over data — the testing-library `render`
 * already pulls in `react-test-renderer`, but its public API exposes
 * `toJSON()` as a function returning `null | object | object[]`.
 */
interface TestRendererJSON {
  type: string;
  props: Record<string, unknown>;
  children: (TestRendererJSON | string)[] | null;
}

/**
 * Convert a `toJSON()` result into our normalized `RenderNode` shape.
 *
 * `toJSON()` may return:
 *   - `null` (component returned nothing — no DOM)
 *   - a single object
 *   - an array of objects (top-level fragments)
 *
 * To keep the rest of the analyzer simple, we collapse arrays under a
 * synthetic `Fragment` root, and `null` becomes `null` (callers handle).
 */
export function normalizeRenderTree(value: unknown): RenderNode | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (Array.isArray(value)) {
    const children: (RenderNode | string)[] = [];
    for (const entry of value) {
      const normalized = normalizeEntry(entry);
      if (normalized !== null) {
        children.push(normalized);
      }
    }
    return { type: 'Fragment', props: {}, children };
  }
  return normalizeNode(value as TestRendererJSON);
}

function normalizeEntry(entry: TestRendererJSON | string): RenderNode | string | null {
  if (typeof entry === 'string') {
    return entry;
  }
  if (entry === null || entry === undefined) {
    return null;
  }
  return normalizeNode(entry);
}

function normalizeNode(node: TestRendererJSON): RenderNode {
  const rawChildren = node.children;
  const children: (RenderNode | string)[] = [];
  if (Array.isArray(rawChildren)) {
    for (const child of rawChildren) {
      const normalized = normalizeEntry(child);
      if (normalized !== null) {
        children.push(normalized);
      }
    }
  }
  return {
    type: node.type,
    props: node.props ?? {},
    children,
  };
}
