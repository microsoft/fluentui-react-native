import { CacheEntry, getMemoCacheEntry } from './getMemoCacheEntry';

export type MemoValue<T, TGet = any> = {
  value: T;
  getMemoValue: (fn: () => TGet, ...keys: any[]) => MemoValue<TGet>;
};

export type GetMemoValue<T> = MemoValue<T, T>['getMemoValue'];

const _baseEntry: CacheEntry<any> = {};

function getMemoValueWorker<T, TGet = any>(entry: CacheEntry<any>, fn: () => T, keys: any[]): MemoValue<T> {
  const foundEntry = getMemoCacheEntry(entry, keys);
  if (foundEntry.value === undefined) {
    foundEntry.value = fn();
  }
  return {
    value: foundEntry.value,
    getMemoValue: (fn: () => TGet, ...keys: any[]) => getMemoValueWorker<TGet>(foundEntry, fn, keys)
  };
}

export function memoValue<T>(fn: () => T, ...keys: any[]): MemoValue<T> {
  return getMemoValueWorker<T>(_baseEntry, fn, keys);
}
