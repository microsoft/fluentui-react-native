import { CacheEntry, getCacheEntry } from './getCacheEntry';

export type ValueFactory<T> = () => T;
export type GetMemoValue<T, TGet = any> = (factory: T | ValueFactory<T>, keys: any[]) => [T, GetMemoValue<TGet>];

const _baseEntry: CacheEntry<any> = {};

function getMemoValueWorker<T, TGet = any>(entry: CacheEntry<any>, factory: T | ValueFactory<T>, keys: any[]): [T, GetMemoValue<TGet>] {
  const foundEntry = getCacheEntry(entry, keys);
  // check the key being set, not the value to disambiguate an undefined factory result/value from never having run the factory
  if (!foundEntry.hasOwnProperty('value') && factory !== undefined && factory !== null) {
    foundEntry.value = typeof factory === 'function' ? (factory as ValueFactory<T>)() : factory;
  }
  return [foundEntry.value, (fact: TGet | ValueFactory<TGet>, args: any[]) => getMemoValueWorker<TGet>(foundEntry, fact, args)];
}

export function getMemoCache<T = any>(key?: object): GetMemoValue<T> {
  const entry = key ? getCacheEntry(_baseEntry, [key]) : {};
  return (fact: T | ValueFactory<T>, args: any[]) => getMemoValueWorker<T>(entry, fact, args);
}
