import type { TokenRegistry } from './tokenRegistry.ts';

/**
 * A single resolved style entry: the raw value that appears on a
 * slot's `style` object, paired with its `tokenPath` when the value
 * can be traced back to a theme token through the registry.
 *
 * `tokenPath` is `undefined` when the value did not originate in the
 * theme — e.g., a literal `padding: 4` written in component code.
 */
export interface ResolvedStyleEntry {
  /** Style property name, e.g. `'backgroundColor'`, `'paddingHorizontal'`. */
  property: string;
  /** Raw value present in the style object. */
  value: unknown;
  /** Registry hit, if any. Dotted path like `'colors.brandBackground'`. */
  tokenPath?: string;
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
 * Reverse-map a resolved style object into token-attributed entries.
 *
 * Skip rules:
 * - `null` / `undefined` values produce no entry — they're noise from
 *   conditional styling and don't carry information.
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
    const tokenPath = registry.lookup(value);
    const entry: ResolvedStyleEntry = { property, value };
    if (tokenPath !== undefined) {
      entry.tokenPath = tokenPath;
    }
    result.push(entry);
  }
  return result;
}
