import { CacheEntry } from './getMemoCacheEntry';
import { mergeKeys, toKey } from './keys';

type Frame<T> = { entry: CacheEntry<T>; keys?: string[] };

function jumpFrameOnStrings<T>(frame: Frame<T>): Frame<T> {
  const { entry, keys } = frame;
  if (keys && keys.length > 0) {
    const key = mergeKeys(keys);
    const byKey = (entry.byKey = entry.byKey || {});
    byKey[key] = byKey[key] || {};
    return { entry: byKey[key] };
  }
  return frame;
}

function jumpFrameOnObject<T>(frame: Frame<T>, obj: object): Frame<T> {
  const { entry } = frame;
  const byObj = (entry.byObj = entry.byObj || new WeakMap<object, CacheEntry<T>>());
  if (!byObj.has(obj)) {
    byObj.set(obj, {});
  }
  return { entry: byObj.get(obj) };
}

export function getMemoCacheEntryReducer<T>(entry: CacheEntry<T>, args: any[]): CacheEntry<T> {
  type Frame = { entry: CacheEntry<T>; keys?: string[] };
  let current: Frame = { entry };

  current = args.reduce((frame: Frame, arg: any) => {
    const { key, isObj } = toKey(arg);
    if (!isObj) {
      frame.keys = (frame.keys || []).concat(key as string);
      return frame;
    }
    frame = jumpFrameOnStrings(frame);
    return jumpFrameOnObject(frame, key as object);
  }, current);
  current = jumpFrameOnStrings(current);

  return current.entry;
}
