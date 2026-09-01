function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Remove undefined projection leaves so they do not overwrite generated defaults.
 */
export function omitUndefinedProperties<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      if (entry === undefined) {
        return [];
      }
      return [[key, isRecord(entry) ? omitUndefinedProperties(entry) : entry]];
    }),
  ) as T;
}
