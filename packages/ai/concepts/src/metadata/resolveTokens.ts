import type { ComponentTokens } from './ComponentTokens.ts';
import type { TokenLayer, TokenSource } from './TokenSource.ts';
import { isTokenSource } from './TokenSource.ts';

/**
 * The flat token map produced by `resolveTokensForState`. Keys are
 * top-level token names from the component's source files
 * (`'backgroundColor'`, `'iconSize'`, `'spacingIconContentBefore'`);
 * values are the `TokenSource` that won the merge for that key under
 * the given active layers.
 */
export type ResolvedTokens = Readonly<Record<string, TokenSource>>;

/**
 * Walk one or more `ComponentTokens` documents and produce the flat
 * token map that would apply when the named `activeLayers` are
 * simultaneously in effect.
 *
 * Resolution rules:
 *
 * 1. Each document is walked depth-first. Leaves (`TokenSource`s) at
 *    the root contribute their values directly. Sub-layers are
 *    entered only when their key appears in `activeLayers`.
 * 2. Sub-layers can themselves contain further sub-layers (e.g.
 *    `primary.hovered`); the same rule applies recursively.
 * 3. Multiple documents are processed in array order — later
 *    documents override earlier ones at the leaf level. This is how
 *    platform-override artifacts (sparse trees) layer on top of the
 *    cross-platform base.
 * 4. Within a single document, deeper / later writes win over
 *    shallower / earlier ones for the same token name.
 *
 * `activeLayers` is the union of every layer name the framework would
 * apply at runtime for a given state combination. This typically
 * includes:
 *
 * - the state names (token-file vocabulary, e.g. `'hovered'`,
 *   `'pressed'` — note these are plural compared to the
 *   `ComponentState` enum);
 * - the appearance name (`'primary'`);
 * - the size and shape (`'medium'`, `'rounded'`);
 * - any structural conditions the styling lookup checks
 *   (`'hasContent'`, `'hasIconBefore'`).
 *
 * The mapping from a `ComponentStates` key (e.g. `'primary-press'`)
 * to the `activeLayers` set is component-specific; the resolver does
 * not bake it in.
 */
export function resolveTokensForState(
  tokens: ComponentTokens | readonly ComponentTokens[],
  activeLayers: readonly string[],
): ResolvedTokens {
  const docs = Array.isArray(tokens) ? tokens : [tokens];
  const layerSet = new Set(activeLayers);
  const out: Record<string, TokenSource> = {};

  for (const doc of docs) {
    walkLayer(doc.layers, layerSet, out);
  }

  return out;
}

function walkLayer(
  layer: TokenLayer,
  active: ReadonlySet<string>,
  out: Record<string, TokenSource>,
): void {
  // Two passes so leaves at this level are written before sub-layer
  // recursion overrides them. This matches how the framework resolves
  // tokens at runtime: base values first, then state overrides on top.
  for (const key of Object.keys(layer)) {
    const value = layer[key];
    if (isTokenSource(value)) {
      out[key] = value;
    }
  }
  for (const key of Object.keys(layer)) {
    const value = layer[key];
    if (!isTokenSource(value) && active.has(key)) {
      walkLayer(value, active, out);
    }
  }
}
