import type { CacheEntry } from './getCacheEntry';
import { getCacheEntry } from './getCacheEntry';

export type ValueFactory<T> = () => T;

/** signature for the cache function */
export type GetMemoValue<T, TGet = any> = (factory: T | ValueFactory<T>, keys: any[]) => [T, GetMemoValue<TGet>];

/** base node used to remember references when a globalKey is set */
const _baseEntry: CacheEntry<any> = {};

/**
 * Primary functional worker used to implement the caching pattern
 *
 * @param entry - entry to use as the base of the cache traversal
 * @param factory - generally a function who's results will be cached, and returned via the set of keys
 * @param keys - an ordered array of values of any type, used as keys to look up the entry
 */
function getMemoValueWorker<T, TGet = any>(entry: CacheEntry<any>, factory: T | ValueFactory<T>, keys: any[]): [T, GetMemoValue<TGet>] {
  const foundEntry = getCacheEntry(entry, keys);
  // check the key being set, not the value to disambiguate an undefined factory result/value from never having run the factory
  if (!foundEntry.hasOwnProperty('value')) {
    foundEntry.value = typeof factory === 'function' ? (factory as ValueFactory<T>)() : factory;
  }
  return [foundEntry.value, (fact: TGet | ValueFactory<TGet>, args: any[]) => getMemoValueWorker<TGet>(foundEntry, fact, args)];
}

/**
 * Get a memo cache instance, this can either be completely self-contained or associated with a global key
 *
 * @param globalKey - optional object reference to use as a key for this cache.  If specified it can be used
 * to retrieve the same cache from the global call.  If not specified the returned cache will be completely isolated.
 */
export function getMemoCache<T = any>(globalKey?: object): GetMemoValue<T> {
  const entry = globalKey ? getCacheEntry(_baseEntry, [globalKey]) : {};
  return (fact: T | ValueFactory<T>, args: any[]) => getMemoValueWorker<T>(entry, fact, args);
}
