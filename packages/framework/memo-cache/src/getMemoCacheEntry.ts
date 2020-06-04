import { mergeKeys, toKey } from './keys';

export type CacheEntry<T> = {
  value?: T;
  byKey?: { [key: string]: CacheEntry<T> };
  byObj?: WeakMap<object, CacheEntry<T>>;
};

function lookupByStrings<T>(entry: CacheEntry<T>, keys: string[]): CacheEntry<T> {
  const byKey = (entry.byKey = entry.byKey || {});
  const key = mergeKeys(keys);
  byKey[key] = byKey[key] || {};
  return byKey[key];
}

function lookupByObject<T>(entry: CacheEntry<T>, obj: object): CacheEntry<T> {
  const byObj = (entry.byObj = entry.byObj || new WeakMap<object, CacheEntry<T>>());
  if (!byObj.has(obj)) {
    byObj.set(obj, {});
  }
  return byObj.get(obj);
}

export function getMemoCacheEntry<T>(entry: CacheEntry<T>, args: any[]): CacheEntry<T> {
  type BranchLookup = (entry: CacheEntry<T>) => CacheEntry<T>;
  const lookups: BranchLookup[] = [];
  let stringKeys: string[] = [];

  for (const arg of args) {
    const { key, isObj } = toKey(arg);
    if (isObj) {
      lookups.push(entry => lookupByObject(entry, key as object));
      stringKeys = [];
    } else {
      if (stringKeys.length === 0) {
        lookups.push(entry => lookupByStrings(entry, stringKeys));
      }
      stringKeys.push(key as string);
    }
  }

  return lookups.reduce((current: CacheEntry<T>, lookup: BranchLookup) => lookup(current), entry);
}
