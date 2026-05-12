import type { ReactTestRenderer } from 'react-test-renderer';

import type { AnalyzerOutput, SlotPath } from '../types.ts';
import { normalizeRenderTree } from '../tree/index.ts';

import { extractStyles } from './extractStyles.ts';
import type { ResolvedStyleEntry } from './resolveStyleToTokens.ts';
import { resolveStyleToTokens } from './resolveStyleToTokens.ts';
import type { TokenRegistry } from './tokenRegistry.ts';

/**
 * The payload returned by {@link mapComponentToTokens}. One entry per
 * node in the rendered tree, in walk order.
 */
export interface ComponentTokenMap {
  slots: readonly {
    /** Indices from root to this slot. `[]` is the root. */
    path: SlotPath;
    /** Slot element type (e.g., `'View'`). */
    type: string;
    /** Forwarded `testID`, if present. */
    testID?: string;
    /**
     * Resolved style entries with optional `tokenPath` annotations.
     * Empty when the slot has no `style` prop.
     */
    entries: readonly ResolvedStyleEntry[];
  }[];
}

/**
 * High-level convenience that turns a `react-test-renderer` instance
 * and a {@link TokenRegistry} into a {@link ComponentTokenMap}.
 *
 * The component name comes from the root node's `type`.
 *
 * `toJSON()` can return an array (multi-root fragment) or a raw object
 * whose children field is `null` rather than an empty array — both would
 * trip `walkTree`. We run the renderer output through `normalizeRenderTree`
 * first so the downstream extract/resolve steps see a stable, single-root
 * shape.
 *
 * Returns an empty slot list when the renderer has no JSON output
 * (e.g., a root component that rendered `null`).
 */
export function mapComponentToTokens(
  renderer: ReactTestRenderer,
  registry: TokenRegistry,
): AnalyzerOutput<ComponentTokenMap> {
  const root = normalizeRenderTree(renderer.toJSON());
  const generatedAt = new Date().toISOString();

  if (root === null) {
    return {
      component: 'unknown',
      generatedAt,
      data: { slots: [] },
    };
  }

  const extracted = extractStyles(root);
  const slots = extracted.map((node) => {
    const entries = resolveStyleToTokens(node.style, registry);
    const slot: ComponentTokenMap['slots'][number] = {
      path: node.path,
      type: node.type,
      entries,
    };
    if (node.testID !== undefined) {
      slot.testID = node.testID;
    }
    return slot;
  });

  return {
    component: root.type,
    generatedAt,
    data: { slots },
  };
}
