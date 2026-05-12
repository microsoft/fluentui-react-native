import type { TokenRegistry } from './tokenRegistry.ts';

/**
 * A single resolved style entry. Attribution works both at the value
 * level (the whole `value` matched a registered token) and per-leaf
 * (the value is an object/array and individual fields/elements match
 * tokens).
 *
 *   - `tokenPath`: `style[property]` as a whole traces back to a token.
 *     For example, variants are registered as objects; spreading the
 *     whole variant across a style produces an entry whose `tokenPath`
 *     references the variant.
 *   - `children`: for object/array values, per-leaf attributions. Used
 *     to reach into composite style values like `shadowOffset: { width,
 *     height }` or `transform: [{ translateX }, ...]`. Omitted when
 *     the value is a primitive or no descendant matches the registry.
 *
 * A plain entry (no `tokenPath` and no `children`) means the value and
 * its descendants were not found in the registry — e.g., a literal
 * `padding: 4` in component code.
 */
export interface ResolvedStyleEntry {
  property: string;
  value: unknown;
  tokenPath?: string;
  children?: readonly ResolvedStyleEntry[];
}

/**
 * RN slot style values can arrive as either a plain object or an
 * array of objects/arrays (recursively). This flattens to a single
 * object using right-most-wins semantics, mirroring how RN itself
 * resolves a `style={[a, b]}` prop.
 *
 * Returns `{}` for `null`, `undefined`, `false`, and other RN
 * tolerates-as-no-style values.
 */
function flattenStyle(input: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (input === null || input === undefined || input === false) {
    return out;
  }
  if (Array.isArray(input)) {
    for (const part of input) {
      const flat = flattenStyle(part);
      for (const k of Object.keys(flat)) {
        out[k] = flat[k];
      }
    }
    return out;
  }
  if (typeof input === 'object') {
    return { ...(input as Record<string, unknown>) };
  }
  return out;
}

/**
 * Recursively attribute a single (property, value) pair.
 *
 * Priority:
 *   1. If `value` itself is registered, return an entry with `tokenPath`.
 *      (This covers variant-level attribution, which is registered at
 *      both the object and leaf level in the test theme.)
 *   2. If `value` is an array, recurse into each entry using the array
 *      index as property. Keep only if any descendant matched.
 *   3. If `value` is a plain object, recurse into each key. Keep only
 *      if any descendant matched.
 *   4. Otherwise (primitive, or no descendant matched), return a plain
 *      entry with no `tokenPath` and no `children`.
 */
function attribute(
  property: string,
  value: unknown,
  registry: TokenRegistry,
): ResolvedStyleEntry {
  const topLevel = registry.lookup(value);
  const entry: ResolvedStyleEntry = { property, value };
  if (topLevel !== undefined) {
    entry.tokenPath = topLevel;
  }

  if (Array.isArray(value)) {
    const children: ResolvedStyleEntry[] = [];
    for (let i = 0; i < value.length; i++) {
      const child = attribute(String(i), value[i], registry);
      if (hasAttribution(child)) {
        children.push(child);
      }
    }
    if (children.length > 0) {
      entry.children = children;
    }
    return entry;
  }

  if (value !== null && typeof value === 'object') {
    const children: ResolvedStyleEntry[] = [];
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const child = attribute(key, (value as Record<string, unknown>)[key], registry);
      if (hasAttribution(child)) {
        children.push(child);
      }
    }
    if (children.length > 0) {
      entry.children = children;
    }
    return entry;
  }

  return entry;
}

/**
 * Returns true if an entry (or any of its descendants) carries a
 * registry hit. Used to decide whether a child should be retained —
 * descending into an object value is only interesting when it actually
 * surfaces token attribution; otherwise the output pairs with the input.
 */
function hasAttribution(entry: ResolvedStyleEntry): boolean {
  return entry.tokenPath !== undefined || entry.children !== undefined;
}

/**
 * Reverse-map a resolved style object into token-attributed entries.
 *
 * Skip rules:
 * - `null` / `undefined` values produce no entry — they're noise from
 *   conditional styling and don't carry information.
 *
 * Nested values: see the docs on `ResolvedStyleEntry.children`.
 *
 * Order is the insertion order of the (flattened) style object.
 */
export function resolveStyleToTokens(
  style: Record<string, unknown> | unknown[] | null | undefined,
  registry: TokenRegistry,
): ResolvedStyleEntry[] {
  const flat = flattenStyle(style);
  const result: ResolvedStyleEntry[] = [];
  for (const property of Object.keys(flat)) {
    const value = flat[property];
    if (value === null || value === undefined) {
      continue;
    }
    result.push(attribute(property, value, registry));
  }
  return result;
}
