/**
 * A bidirectional registry that maps a theme token path (string, e.g.
 * `'colors.brandBackground'`) to the unique sentinel value produced
 * for it by {@link createTestTheme}.
 *
 * Why this exists: token resolution in FluentUI RN is a one-way pure
 * function `theme -> resolved style`. Once a slot's style object is
 * computed, the original token name is gone. By making the theme
 * produce **unique sentinel values per token** and remembering the
 * mapping in a registry, downstream tools can reverse the resolution:
 * given a style value, find the token that produced it.
 *
 * The registry refuses to register the same value under two different
 * paths — that would make {@link TokenRegistry.lookup} ambiguous and is
 * a defect in the sentinel-generation strategy (test-theme uses a
 * hash-based color generator that can in principle collide; the
 * `createTestTheme` builder is responsible for salting and retrying
 * until all leaf values are unique).
 */

/**
 * A single entry recorded by the registry. The `value` is the leaf
 * sentinel emitted by the theme; the `path` is its dotted location in
 * the theme tree (e.g., `'colors.brandBackground'`, `'spacing.s1'`).
 */
export interface TokenRegistryEntry {
  readonly path: string;
  readonly value: unknown;
}

/**
 * The registry's public interface. `lookup` is the hot path used by
 * {@link resolveStyleToTokens}; `register` is called only at theme
 * construction time.
 */
export interface TokenRegistry {
  /**
   * Look up the token path that produced a given value.
   *
   * Returns `undefined` for `null`, `undefined`, and any value that
   * was never registered (e.g., a literal value applied directly to a
   * style by component code, with no token origin).
   */
  lookup(value: unknown): string | undefined;

  /**
   * Register a `(path -> value)` mapping. Throws if `value` is already
   * recorded under a different path; throws if `path` is already
   * recorded with a different value. Re-registering an identical pair
   * is a no-op.
   *
   * `null` and `undefined` are silently ignored — those values are too
   * common in style objects to be useful sentinels, and treating them
   * as token-producing would corrupt the reverse map.
   */
  register(path: string, value: unknown): void;

  /**
   * Snapshot of all entries for debugging. Order is insertion order.
   * The returned array is a fresh copy; mutating it does not affect
   * the registry.
   */
  entries(): readonly TokenRegistryEntry[];
}

/**
 * Construct an empty {@link TokenRegistry}.
 *
 * Two maps are kept under the hood: `value -> path` for fast lookup,
 * and `path -> value` for collision detection.
 */
export function createTokenRegistry(): TokenRegistry {
  const valueToPath = new Map<unknown, string>();
  const pathToValue = new Map<string, unknown>();
  const ordered: TokenRegistryEntry[] = [];

  return {
    lookup(value: unknown): string | undefined {
      if (value === null || value === undefined) {
        return undefined;
      }
      return valueToPath.get(value);
    },

    register(path: string, value: unknown): void {
      if (value === null || value === undefined) {
        return;
      }
      const existingPath = valueToPath.get(value);
      if (existingPath !== undefined) {
        if (existingPath === path) {
          return;
        }
        throw new Error(
          `TokenRegistry: value collision — paths ${JSON.stringify(existingPath)} and ${JSON.stringify(
            path,
          )} both map to ${String(value)}`,
        );
      }
      const existingValue = pathToValue.get(path);
      if (existingValue !== undefined) {
        throw new Error(
          `TokenRegistry: path ${JSON.stringify(path)} is already registered with a different value (existing=${String(
            existingValue,
          )}, new=${String(value)})`,
        );
      }
      valueToPath.set(value, path);
      pathToValue.set(path, value);
      ordered.push({ path, value });
    },

    entries(): readonly TokenRegistryEntry[] {
      return ordered.slice();
    },
  };
}
