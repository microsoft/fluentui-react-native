import { CacheEntry, getMemoCacheEntry } from './getMemoCacheEntry';

export type ValueFactory<T> = () => T;
export type GetMemoValue<T, TGet = any> = (factory: T | ValueFactory<T>, keys: any[]) => [T, GetMemoValue<TGet>];

const _baseEntry: CacheEntry<any> = {};

function getMemoValueWorker<T, TGet = any>(entry: CacheEntry<any>, factory: T | ValueFactory<T>, keys: any[]): [T, GetMemoValue<TGet>] {
  const foundEntry = getMemoCacheEntry(entry, keys);
  if (foundEntry.value === undefined && factory !== undefined && factory !== null) {
    foundEntry.value = typeof factory === 'function' ? (factory as ValueFactory<T>)() : factory;
  }
  return [foundEntry.value, (fact: TGet | ValueFactory<TGet>, args: any[]) => getMemoValueWorker<TGet>(foundEntry, fact, args)];
}

export function getMemoCache<T = any>(key?: object): GetMemoValue<T> {
  const entry = key ? getMemoCacheEntry(_baseEntry, [key]) : {};
  return (fact: T | ValueFactory<T>, args: any[]) => getMemoValueWorker<T>(entry, fact, args);
}
