/**
 * This defines a mapping of one object from another.
 * - keys are the destination object keys, separated by dots for nested objects
 * - values are the source object keys, separated by dots for nested objects
 */
export type ObjectFromObjectMapping = Record<string, string>;

export type InvalidPathReason = 'empty' | 'unsafe';

const unsafePathSegments = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Split a dotted object path, rejecting empty and prototype-polluting segments with the caller's error.
 */
export function splitObjectPath(path: string, invalidPath: (reason: InvalidPathReason) => Error): string[] {
  const segments = path.split('.');
  if (segments.some((segment) => segment.length === 0)) {
    throw invalidPath('empty');
  }
  if (segments.some((segment) => unsafePathSegments.has(segment))) {
    throw invalidPath('unsafe');
  }
  return segments;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Read an own value at the path, or undefined when any segment is missing.
 */
export function getValueAtSegments(source: object, segments: readonly string[]): unknown {
  let value: unknown = source;
  for (const segment of segments) {
    if (!isRecord(value) || !Object.prototype.hasOwnProperty.call(value, segment)) {
      return undefined;
    }
    value = value[segment];
  }
  return value;
}

/**
 * Return the record that owns the path's leaf, creating missing parents. A non-record parent throws the caller's error.
 */
export function ensureParentRecord(
  destination: Record<string, unknown>,
  segments: readonly string[],
  conflict: (segment: string) => Error,
): Record<string, unknown> {
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
      throw conflict(segment);
    }
  }
  return target;
}

function getPathSegments(path: string, pathKind: 'source' | 'destination'): string[] {
  return splitObjectPath(path, (reason) => new Error(`${reason === 'empty' ? 'Invalid' : 'Unsafe'} ${pathKind} path "${path}".`));
}

function getValueAtPath(source: object, path: string): unknown {
  return getValueAtSegments(source, getPathSegments(path, 'source'));
}

function setValueAtPath(destination: Record<string, unknown>, path: string, value: unknown): void {
  const segments = getPathSegments(path, 'destination');
  const target = ensureParentRecord(
    destination,
    segments,
    (segment) => new Error(`Cannot create destination path "${path}" because "${segment}" is not an object.`),
  );

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
