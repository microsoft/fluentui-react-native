export type CacheEntry<T, TGet = any> = {
  /** stores the cached value if any */
  value?: T;

  /** entry used for undefined and null values, these both collapse to the same type */
  empty?: CacheEntry<TGet>;

  /** entry used for the case where the array of args is null or length 0 */
  noargs?: CacheEntry<TGet>;

  /** all remaining non-object types are keyed as strings for lookups */
  str?: { [key: string]: CacheEntry<TGet> };

  /** object types are keyed in a weak map on object identity */
  obj?: WeakMap<object, TGet>;
};

/**
 * just wraps the common entry.foo = entry.foo || {} pattern
 * @param entry - entry to ensure a key value for
 * @param key - which key of that entry to ensure the value for
 */
function ensureAndReturn(entry: CacheEntry<any>, key: keyof CacheEntry<any>): CacheEntry<any> | { [key: string]: CacheEntry<any> } {
  if ((key as string) === '__proto__' || (key as string) === 'constructor' || (key as string) === 'prototype') {
    throw new Error('Invalid key');
  }
  return (entry[key] = entry[key] || {});
}

/**
 * Step one level deeper in the cache, based on the key value from the current location
 *
 * @param entry - base entry to work from
 * @param val - value to use as the key for progressing to the next level of the cache
 */
function jumpToCacheEntry(entry: CacheEntry<any>, val: any): CacheEntry<any> {
  if (val === undefined || val === null) {
    // undefined or null just routes directly to the empty object.  This avoids the issues of string collisions with 'null' or 'undefined'
    // when using the string key map, it also avoids creating the WeakMap (since null is technically typoef object), particularly in cases
    // where null is just being set on non-object types.
    return ensureAndReturn(entry, 'empty');
  }
  if (typeof val === 'object' || typeof val === 'function') {
    // objects and functions will be treated as key values in a WeakMap
    const byObj = (entry.obj = entry.obj || new WeakMap<object, CacheEntry<any>>());
    return byObj.get(val) || byObj.set(val, {}).get(val);
  }
  // otherwise convert everything to a string and store it in the str object (using it as a map)
  const key = val + '';
  const byString = ensureAndReturn(entry, 'str');
  return (byString[key] = byString[key] || {});
}

/**
 * Given a base entry, either traverse or build the cache tree that matches the provided args
 *
 * @param entry - entry to use as the base of the cache walk
 * @param args - array of arguments to use to progress deeper into the cache
 */
export function getCacheEntry<T, TGet = any>(entry: CacheEntry<T>, args: any[]): CacheEntry<TGet> {
  // in the case where the args array exists and is > 0 length:
  // - walk the cache from entry, like a linked list, jumping to the next entry by key, building it up as you go
  // - otherwise if there are no args just use the noargs branch
  return args && args.length > 0
    ? (args.reduce((previous: CacheEntry<any>, arg: any) => jumpToCacheEntry(previous, arg), entry) as CacheEntry<TGet>)
    : ensureAndReturn(entry, 'noargs');
}
