export type CacheEntry<T, TGet = any> = {
  value?: T;
  empty?: CacheEntry<TGet>;
  noargs?: CacheEntry<TGet>;
  str?: { [key: string]: CacheEntry<TGet> };
  obj?: WeakMap<object, TGet>;
};

function ensureAndReturn(entry: CacheEntry<any>, key: keyof CacheEntry<any>): CacheEntry<any> | { [key: string]: CacheEntry<any> } {
  return (entry[key] = entry[key] || {});
}

function jumpToCacheEntry(entry: CacheEntry<any>, val: any): CacheEntry<any> {
  if (val === undefined || val === null) {
    return ensureAndReturn(entry, 'empty');
  }
  if (typeof val === 'object' || typeof val === 'function') {
    const byObj = (entry.obj = entry.obj || new WeakMap<object, CacheEntry<any>>());
    return byObj.get(val) || byObj.set(val, {}).get(val);
  }
  const key = val + '';
  const byString = ensureAndReturn(entry, 'str');
  return (byString[key] = byString[key] || {});
}

export function getCacheEntry<T, TGet = any>(entry: CacheEntry<T>, args: any[]): CacheEntry<TGet> {
  return args && args.length > 0
    ? (args.reduce((previous: CacheEntry<any>, arg: any) => jumpToCacheEntry(previous, arg), entry) as CacheEntry<TGet>)
    : ensureAndReturn(entry, 'noargs');
}
