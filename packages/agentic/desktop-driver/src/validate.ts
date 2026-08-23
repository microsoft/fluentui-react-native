/**
 * Minimal structural validation helpers.
 *
 * The package validates every serializable boundary payload (portable config, story plans,
 * loopback service requests) without taking a schema-library dependency, because the core must
 * stay dependency-free enough to run inside a driver-host child process.
 */

/** Accumulates human-readable validation messages under a JSON pointer-ish path. */
export class ValidationIssues {
  private readonly issues: string[] = [];

  add(path: string, message: string): void {
    this.issues.push(`${path} ${message}`);
  }

  get length(): number {
    return this.issues.length;
  }

  list(): readonly string[] {
    return this.issues;
  }
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Returns true when `value` contains only JSON primitives, arrays, and plain objects.
 *
 * Used to reject anything that could smuggle executable behaviour across the device/host
 * boundary before it is written to a manifest or a service payload.
 */
export function isJsonSerializable(value: unknown, ancestors = new Set<unknown>()): boolean {
  if (value === null) {
    return true;
  }
  const kind = typeof value;
  if (kind === 'string' || kind === 'number' || kind === 'boolean') {
    return kind !== 'number' || Number.isFinite(value as number);
  }
  if (kind !== 'object') {
    return false;
  }
  if (ancestors.has(value)) {
    return false;
  }
  ancestors.add(value);
  let serializable: boolean;
  if (Array.isArray(value)) {
    serializable = value.every((entry) => isJsonSerializable(entry, ancestors));
  } else if (!isPlainObject(value)) {
    serializable = false;
  } else {
    serializable = Object.values(value).every((entry) => entry === undefined || isJsonSerializable(entry, ancestors));
  }
  ancestors.delete(value);
  return serializable;
}

/** Asserts that `value` is one of `allowed`, recording an issue otherwise. */
export function expectEnum<T extends string>(issues: ValidationIssues, path: string, value: unknown, allowed: readonly T[]): value is T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    issues.add(path, `must be one of ${allowed.join(', ')}`);
    return false;
  }
  return true;
}
