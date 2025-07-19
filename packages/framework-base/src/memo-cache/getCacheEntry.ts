/** signature for the object/function key values, used for memoization */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type MemoObjectKey = object | Function;

export type CacheEntry = {
  /** stores the cached value if any */
  value?: unknown;

  /** entry used for undefined and null values, these both collapse to the same type */
  empty?: CacheEntry;

  /** entry used for the case where the array of args is null or length 0 */
  noargs?: CacheEntry;

  /** all remaining non-object types are keyed as strings for lookups */
  str?: Record<string, CacheEntry>;

  /** object types are keyed in a weak map on object identity */
  obj?: WeakMap<MemoObjectKey, CacheEntry>;
};

function getEmptyEntry(entry: CacheEntry): CacheEntry {
  return (entry.empty ??= {});
}

function tryObjectEntry(entry: CacheEntry, val: unknown): CacheEntry | undefined {
  if (typeof val === 'object' || typeof val === 'function') {
    entry.obj ??= new WeakMap<MemoObjectKey, CacheEntry>();
    if (!entry.obj.get(val)) {
      entry.obj.set(val, {});
    }
    return entry.obj.get(val);
  }
  return undefined;
}

function getStringEntry(entry: CacheEntry, key: unknown): CacheEntry {
  const strKey = key + '';
  entry.str ??= {};
  return (entry.str[strKey] ??= {});
}

function getNoargsEntry(entry: CacheEntry): CacheEntry {
  return (entry.noargs ??= {});
}

/**
 * Step one level deeper in the cache, based on the key value from the current location
 *
 * @param entry - base entry to work from
 * @param val - value to use as the key for progressing to the next level of the cache
 */
function jumpToCacheEntry(entry: CacheEntry, val: unknown): CacheEntry {
  if (val === undefined || val === null) {
    // undefined or null just routes directly to the empty object.  This avoids the issues of string collisions with 'null' or 'undefined'
    // when using the string key map, it also avoids creating the WeakMap (since null is technically typoef object), particularly in cases
    // where null is just being set on non-object types.
    return getEmptyEntry(entry);
  }
  // otherwise convert everything to a string and store it in the str object (using it as a map)
  return tryObjectEntry(entry, val) ?? getStringEntry(entry, val);
}

/**
 * Given a base entry, either traverse or build the cache tree that matches the provided args
 *
 * @param entry - entry to use as the base of the cache walk
 * @param args - array of arguments to use to progress deeper into the cache
 */
export function getCacheEntry(entry: CacheEntry, args: unknown[]): CacheEntry {
  // in the case where the args array exists and is > 0 length:
  // - walk the cache from entry, like a linked list, jumping to the next entry by key, building it up as you go
  // - otherwise if there are no args just use the noargs branch
  return args && args.length > 0
    ? args.reduce((previous: CacheEntry, arg: unknown) => jumpToCacheEntry(previous, arg), entry)
    : getNoargsEntry(entry);
}
