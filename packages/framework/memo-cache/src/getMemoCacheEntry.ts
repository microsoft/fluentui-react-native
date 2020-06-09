import { mergeKeys, toKey } from './keys';

export type CacheEntry<T, TGet = any> = {
  value?: T;
  byKey?: { [key: string]: CacheEntry<TGet> };
  byObj?: WeakMap<object, TGet>;
};

function ensureEntry<T>(entry: CacheEntry<T>, obj?: object, keys?: string[]): CacheEntry<T> {
  if (obj) {
    const byObj = (entry.byObj = entry.byObj || new WeakMap<object, CacheEntry<T>>());
    if (!byObj.has(obj)) {
      byObj.set(obj, {});
    }
    return byObj.get(obj);
  }
  const key = mergeKeys(keys!);
  const byKey = (entry.byKey = entry.byKey || {});
  byKey[key] = byKey[key] || {};
  return byKey[key];
}

export function getMemoCacheEntry<T>(entry: CacheEntry<T>, args: any[]): CacheEntry<T> {
  type Jump = { obj?: object; keys?: string[] };
  return args
    .reduce((jumps: Jump[], arg: any) => {
      const { key, isObj } = toKey(arg);
      if (jumps.length === 0 || isObj || jumps[jumps.length - 1].obj) {
        return jumps.concat(isObj ? { obj: key as object } : { keys: [key as string] });
      }
      jumps[jumps.length - 1].keys.push(key as string);
      return jumps;
    }, [])
    .reduce((lastEntry: CacheEntry<T>, jump: Jump) => {
      return ensureEntry(lastEntry, jump.obj, jump.keys);
    }, entry);
}
