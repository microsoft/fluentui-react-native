/**
 * This defines a mapping of one object from another.
 * - keys are the destination object keys, separated by dots for nested objects
 * - values are the source object keys, separated by dots for nested objects
 */
export type ObjectFromObjectMapping = Record<string, string>;

const unsafePathSegments = new Set(['__proto__', 'constructor', 'prototype']);

function getPathSegments(path: string, pathKind: 'source' | 'destination'): string[] {
  const segments = path.split('.');
  if (segments.some((segment) => segment.length === 0)) {
    throw new Error(`Invalid ${pathKind} path "${path}".`);
  }
  if (segments.some((segment) => unsafePathSegments.has(segment))) {
    throw new Error(`Unsafe ${pathKind} path "${path}".`);
  }
  return segments;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getValueAtPath(source: object, path: string): unknown {
  let value: unknown = source;
  for (const segment of getPathSegments(path, 'source')) {
    if (!isRecord(value) || !Object.prototype.hasOwnProperty.call(value, segment)) {
      return undefined;
    }
    value = value[segment];
  }
  return value;
}

function setValueAtPath(destination: Record<string, unknown>, path: string, value: unknown): void {
  const segments = getPathSegments(path, 'destination');
  let target = destination;

  for (const segment of segments.slice(0, -1)) {
    const existing = target[segment];
    if (existing === undefined) {
      const nested: Record<string, unknown> = {};
      target[segment] = nested;
      target = nested;
    } else if (isRecord(existing)) {
      target = existing;
    } else {
      throw new Error(`Cannot create destination path "${path}" because "${segment}" is not an object.`);
    }
  }

  const leaf = segments[segments.length - 1];
  if (target[leaf] !== undefined) {
    throw new Error(`Cannot create destination path "${path}" because "${leaf}" is already defined.`);
  }
  target[leaf] = value;
}

/**
 * Create a new object from a source object, using a mapping of destination keys from source keys.
 */
export function mapObjectFromObject<T extends object>(source: object, mapping: ObjectFromObjectMapping): T {
  const result: Record<string, unknown> = {};

  for (const [destinationPath, sourcePath] of Object.entries(mapping)) {
    const value = getValueAtPath(source, sourcePath);
    if (value !== undefined) {
      setValueAtPath(result, destinationPath, value);
    }
  }

  return result as T;
}
