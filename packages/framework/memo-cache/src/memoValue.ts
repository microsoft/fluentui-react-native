import { CacheEntry, getMemoCacheEntry } from './getMemoCacheEntry';

export type ValueFactory<T> = () => T;
export type GetMemoValue<T, TGet = any> = (factory: T | ValueFactory<T>, ...keys: any[]) => [T, GetMemoValue<TGet>];

const _baseEntry: CacheEntry<any> = {};

function getMemoValueWorker<T, TGet = any>(entry: CacheEntry<any>, factory: T | ValueFactory<T>, keys: any[]): [T, GetMemoValue<TGet>] {
  const foundEntry = getMemoCacheEntry(entry, keys);
  if (foundEntry.value === undefined) {
    foundEntry.value = typeof factory === 'function' ? (factory as ValueFactory<T>)() : factory;
  }
  return [foundEntry.value, (fact: TGet | ValueFactory<TGet>, ...args: any[]) => getMemoValueWorker<TGet>(foundEntry, fact, args)];
}

export function memoValue<T, TGet = any>(factory: T | ValueFactory<T>, ...keys: any[]): [T, GetMemoValue<TGet>] {
  return getMemoValueWorker<T>(_baseEntry, factory, keys);
}
