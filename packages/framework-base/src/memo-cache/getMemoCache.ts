import type { CacheEntry } from './getCacheEntry';
import { getCacheEntry } from './getCacheEntry';

export type ValueFactory<T> = () => T;

/**
 * Signature for the cache function. While the implementation is generic, it can run in two modes:
 * - Typed: the cache will enforce the type of both the factory and returned value
 * - Untyped: the cache will infer the type on each call from the factory return value
 */
export type GetTypedMemoValue<T> = (factory: T | ValueFactory<T>, keys: unknown[]) => [T, GetTypedMemoValue<T>];
export type GetMemoValue = <T>(factory: T | ValueFactory<T>, keys: unknown[]) => [T, GetMemoValue];

/** base node used to remember references when a globalKey is set */
const _baseEntry: CacheEntry = {};

/**
 * Primary functional worker used to implement the caching pattern
 *
 * @param entry - entry to use as the base of the cache traversal
 * @param factory - generally a function who's results will be cached, and returned via the set of keys
 * @param keys - an ordered array of values of any type, used as keys to look up the entry
 */
function getMemoValueWorker<T>(entry: CacheEntry, factory: T | ValueFactory<T>, keys: unknown[]): [T, GetMemoValue] {
  const foundEntry = getCacheEntry(entry, keys);
  // check the key being set, not the value to disambiguate an undefined factory result/value from never having run the factory
  if (!Object.prototype.hasOwnProperty.call(foundEntry, 'value')) {
    foundEntry.value = typeof factory === 'function' ? (factory as ValueFactory<T>)() : factory;
  }
  return [foundEntry.value as T, <U>(fact: U | ValueFactory<U>, args: unknown[]) => getMemoValueWorker<U>(foundEntry, fact, args)];
}

/**
 * Get a memo cache instance, this can either be completely self-contained or associated with a global key
 *
 * @param globalKey - optional object reference to use as a key for this cache.  If specified it can be used
 * to retrieve the same cache from the global call.  If not specified the returned cache will be completely isolated.
 */
export function getMemoCache(globalKey?: object): GetMemoValue {
  const entry = globalKey ? getCacheEntry(_baseEntry, [globalKey]) : {};
  return (fact, args) => getMemoValueWorker(entry, fact, args);
}

/**
 * Get a typed memo cache instance, this can either be completely self-contained or associated with a global key
 *
 * @param globalKey - optional object reference to use as a key for this cache.  If specified it can be used
 * to retrieve the same cache from the global call.  If not specified the returned cache will be completely isolated.
 */
export function getTypedMemoCache<T>(globalKey?: object): GetTypedMemoValue<T> {
  const entry = globalKey ? getCacheEntry(_baseEntry, [globalKey]) : {};
  return (fact, args) => getMemoValueWorker(entry, fact, args);
}
