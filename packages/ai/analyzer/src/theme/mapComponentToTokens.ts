import type { ReactTestRenderer } from 'react-test-renderer';

import type { AnalyzerOutput, RenderNode, SlotPath } from '../types.ts';

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
 * Inspect the `react-test-renderer` JSON shape. The output is
 * `ReactTestRendererJSON | ReactTestRendererJSON[] | null` — for
 * analyzer purposes we narrow to a single root node, which is what
 * 99% of real component renders produce.
 */
function rendererRoot(renderer: ReactTestRenderer): RenderNode | undefined {
  const json = renderer.toJSON();
  if (json === null || json === undefined) {
    return undefined;
  }
  if (Array.isArray(json)) {
    // Multi-root renders are rare and the analyzer surface intentionally
    // doesn't try to merge them. Pick the first; callers wanting fuller
    // coverage can pre-wrap their component in a single host element.
    return json[0] as unknown as RenderNode;
  }
  // The `RenderNode` shape is structurally compatible with
  // `ReactTestRendererJSON`: both have `type`, `props`, `children`.
  return json as unknown as RenderNode;
}

/**
 * High-level convenience that turns a `react-test-renderer` instance
 * and a {@link TokenRegistry} into a {@link ComponentTokenMap}.
 *
 * The component name comes from the root node's `type`; the variant
 * field is left undefined here (specific tests can attach variant
 * labels by post-processing the output, since the analyzer can't know
 * which combination of props the caller treats as a variant).
 *
 * Returns an empty slot list when the renderer has no JSON output
 * (e.g., a root component that rendered `null`).
 */
export function mapComponentToTokens(
  renderer: ReactTestRenderer,
  registry: TokenRegistry,
): AnalyzerOutput<ComponentTokenMap> {
  const root = rendererRoot(renderer);
  const generatedAt = new Date().toISOString();

  if (!root) {
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
