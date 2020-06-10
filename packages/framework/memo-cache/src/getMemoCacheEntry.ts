import { mergeKeys, toKey } from './keys';

export type CacheEntry<T, TGet = any> = {
  value?: T;
  byKey?: { [key: string]: CacheEntry<TGet> };
  byObj?: WeakMap<object, TGet>;
};

type Key = object | string[];

function ensureEntry<T>(entry: CacheEntry<T>, key: Key): CacheEntry<T> {
  if (!Array.isArray(key)) {
    const byObj = (entry.byObj = entry.byObj || new WeakMap<object, CacheEntry<T>>());
    if (!byObj.has(key)) {
      byObj.set(key, {});
    }
    return byObj.get(key);
  }
  const merged = mergeKeys(key);
  const byKey = (entry.byKey = entry.byKey || {});
  byKey[merged] = byKey[merged] || {};
  return byKey[merged];
}

export function getMemoCacheEntry<T>(entry: CacheEntry<T>, args: any[]): CacheEntry<T> {
  return args
    .reduce((keys: Key[], arg: any) => {
      const { key, isObj } = toKey(arg);
      if (keys.length === 0 || isObj || !Array.isArray(keys[keys.length - 1])) {
        keys.push(isObj ? (key as object) : [key as string]);
        return keys;
      }
      (keys[keys.length - 1] as string[]).push(key as string);
      return keys;
    }, [])
    .reduce((lastEntry: CacheEntry<T>, key: Key) => {
      return ensureEntry(lastEntry, key);
    }, entry);
}
