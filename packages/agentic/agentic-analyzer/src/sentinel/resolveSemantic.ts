import type { ReverseMap } from './reverseMap.ts';

/**
 * Deep-merge `source` into `target` (mutating `target`), merging nested plain
 * objects recursively and letting `source` leaves override `target` leaves.
 *
 * Arrays and non-plain values are treated as leaves (replaced wholesale).
 */
export function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];
    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      deepMerge(targetValue, sourceValue);
    } else if (isPlainObject(sourceValue)) {
      // Clone the incoming object so later merges don't alias the source tree.
      target[key] = deepMerge({}, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  }
  return target;
}

/**
 * Recursively walk `value`, replacing any string leaf that is present in
 * `reverseMap` with its semantic path name. All other leaves (numbers, literal
 * strings like `'100%'`, variant names like `'bodySemibold'`, globalTokens-derived
 * numbers) are returned unchanged.
 *
 * Returns a new plain, JSON-serializable structure; the input is not mutated.
 */
export function resolveSemantic(value: unknown, reverseMap: ReverseMap): unknown {
  if (typeof value === 'string') {
    return reverseMap.get(value) ?? value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveSemantic(item, reverseMap));
  }
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      result[key] = resolveSemantic(value[key], reverseMap);
    }
    return result;
  }
  // numbers, booleans, null, undefined, functions — leave as-is
  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
