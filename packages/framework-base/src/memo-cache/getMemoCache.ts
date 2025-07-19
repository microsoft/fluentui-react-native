import type { CacheEntry, MemoObjectKey } from './getCacheEntry';
import { getCacheEntry } from './getCacheEntry';

export type ValueFactory<T> = () => T;
export type FactoryType<T> = T | ValueFactory<T>;

/**
 * Signature for the cache function returned from getMemoCache.
 *
 * There are two patterns here that are somewhat mutually exclusive.
 *
 * Generic cache:
 *   The cache itself runs in a generic mode, and the signature of the query into the cache either
 *   has the type inferred from the factory, or gets specified by the caller. This is useful when
 *   the caller is doing a lot of different types of caching, and wants to avoid creating
 *   multiple cache instances. It also avoids more subtle issues around type inference failing in
 *   parameters. For instance if you have:
 *     function foo<T>(x: T, y: GetMemoValue<T>)
 *   typescript will try to infer T from both x and y, which can lead to unexpected results, as the inferencing
 *   on y will sometimes fail, causing a conflict with the inference from x, leading to T being inferred as unknown.
 *
 * Typed cache:
 *   The cache is created with a specific type in mind, and the signature of the query into the cache
 *   always returns that type. This is useful when the cache is only ever going to be used for a single type,
 *   and it avoids the need for the caller to specify the type on every call.
 */
export type GenericMemoValue = <T>(factory: FactoryType<T>, keys: unknown[]) => MemoResult<T>;
export type GetMemoValue<T> = (factory: FactoryType<T>, keys: unknown[]) => TypedMemoResult<T>;

/** type helper for parameters that accept typed or untyped memo values */
export type AnyGetMemoValue<T> = GetMemoValue<T> | GenericMemoValue;

/**
 * signatures for tuples returned from GetMemoValue, generic caches return tuples with untyped GetMemoValue
 * typed caches return tuples with typed GetMemoValue
 */
export type MemoResult<T> = [T, GenericMemoValue];
export type TypedMemoResult<T> = [T, GetMemoValue<T>];

/** base node used to remember references when a globalKey is set */
const _baseEntry: CacheEntry = {};

/**
 * Primary functional worker used to implement the caching pattern
 *
 * @param entry - entry to use as the base of the cache traversal
 * @param factory - generally a function who's results will be cached, and returned via the set of keys
 * @param keys - an ordered array of values of any type, used as keys to look up the entry
 */
function getMemoValueWorker<T>(entry: CacheEntry, factory: T | ValueFactory<T>, keys: unknown[]): [T, GetMemoValue<T>] {
  const foundEntry = getCacheEntry(entry, keys);
  // check the key being set, not the value to disambiguate an undefined factory result/value from never having run the factory
  if (!Object.prototype.hasOwnProperty.call(foundEntry, 'value')) {
    foundEntry.value = typeof factory === 'function' ? (factory as ValueFactory<T>)() : factory;
  }
  return [
    foundEntry.value as T,
    <TGet>(fact: TGet | ValueFactory<TGet>, args: unknown[]) => getMemoValueWorker<TGet>(foundEntry, fact, args),
  ];
}

/**
 * Get a memo cache instance, this can either be completely self-contained or associated with a global key
 *
 * @param globalKey - optional object reference to use as a key for this cache.  If specified it can be used
 * to retrieve the same cache from the global call.  If not specified the returned cache will be completely isolated.
 */
export function getMemoCache(globalKey?: MemoObjectKey): GenericMemoValue {
  const entry = globalKey ? getCacheEntry(_baseEntry, [globalKey]) : {};
  return <T>(fact: T | ValueFactory<T>, args: unknown[]) => getMemoValueWorker<T>(entry, fact, args);
}

/**
 * Get a typed memo cache instance
 *
 * @param globalKey - optional object reference to use as a key for this cache.  If specified it can be used
 * to retrieve the same cache from the global call.  If not specified the returned cache will be completely isolated.
 */
export function getTypedMemoCache<T>(globalKey?: MemoObjectKey): GetMemoValue<T> {
  return getMemoCache(globalKey) as GetMemoValue<T>;
}

/** type coercion helper */
export function asTypedMemoCache<T>(cache: AnyGetMemoValue<T>): GetMemoValue<T> {
  return cache as GetMemoValue<T>;
}

/** type coercion helper */
export function asGenericMemoCache<T>(cache: AnyGetMemoValue<T>): GenericMemoValue {
  return cache as GenericMemoValue;
}
