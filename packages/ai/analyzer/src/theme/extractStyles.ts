import type { RenderNode, SlotPath } from '../types.ts';
import { walkTree } from '../tree/index.ts';

/**
 * A node in the rendered tree that carries enough information for
 * style/token reverse mapping. We include nodes even when their
 * `style` prop is absent so that downstream tools (e.g., the
 * `mapComponentToTokens` view) can still surface slot identity.
 */
export interface ExtractedStyle {
  /**
   * Indices from the root to this node, as produced by
   * {@link walkTree}. The empty array `[]` is the root.
   */
  path: SlotPath;
  /** Node type, e.g. `'View'`, `'Text'`. */
  type: string;
  /**
   * Forwarded `testID` if the slot carries one — useful to disambiguate
   * slots in a complex render tree (Button root, content, icon, etc.).
   */
  testID?: string;
  /**
   * The raw `style` prop. Can be `undefined`, a single object, or an
   * array of objects (RN style arrays). Callers should pass it
   * unmodified to {@link resolveStyleToTokens}, which handles
   * normalization.
   */
  style: Record<string, unknown> | unknown[] | undefined;
}

/**
 * Walk a rendered tree, collecting one {@link ExtractedStyle} per
 * node. Only the props relevant to style/token mapping (`style`,
 * `testID`) are preserved — full node introspection lives in
 * `walkTree` / `extractA11yTree`.
 *
 * Nodes without a `style` prop are still emitted (with `style:
 * undefined`); this lets callers report a complete slot list even
 * when only some slots are themed.
 */
export function extractStyles(root: RenderNode): ExtractedStyle[] {
  const out: ExtractedStyle[] = [];
  walkTree(root, (node, path) => {
    const props = node.props;
    const styleProp = props['style'];
    // Style is permitted to be undefined, a plain object, or an array.
    // Anything else (e.g. a number, like RN sometimes uses for registered
    // styles) gets normalized to undefined so downstream code doesn't
    // have to defend against it.
    let style: Record<string, unknown> | unknown[] | undefined;
    if (styleProp === undefined || styleProp === null) {
      style = undefined;
    } else if (Array.isArray(styleProp)) {
      style = styleProp as unknown[];
    } else if (typeof styleProp === 'object') {
      style = styleProp as Record<string, unknown>;
    } else {
      style = undefined;
    }

    const entry: ExtractedStyle = {
      path,
      type: node.type,
      style,
    };
    const testID = props['testID'];
    if (typeof testID === 'string') {
      entry.testID = testID;
    }
    out.push(entry);
  });
  return out;
}
