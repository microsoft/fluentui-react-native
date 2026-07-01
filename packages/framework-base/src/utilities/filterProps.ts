import { mergeProps } from '../merge-props/mergeProps.ts';
import { isObject } from './typeUtils.ts';
import type { PropsFilter } from '../types/props.types.ts';

export function filterProps<TProps>(props: TProps, filter?: PropsFilter): TProps {
  if (filter && isObject(props)) {
    const propsToRemove = filter ? Object.keys(props).filter((key) => !filter(key)) : [];
    if (propsToRemove?.length > 0) {
      const propsToRemoveObj = Object.fromEntries(propsToRemove.map((prop) => [prop, undefined])) as TProps;
      return mergeProps(props, propsToRemoveObj);
    }
  }
  return props;
}

/**
 * Caching wrapper that turns filters into transform functions. Realistically we only have three main filters in the library
 * that are rarely used. This will create wrappers on demand that will be cached and re-used.
 * @internal
 */
export const transformFromFilter = (() => {
  // weak map for caching transform functions
  type TransformCache = WeakMap<PropsFilter, <T>(props: T) => T>;
  let cache: TransformCache;
  return <TProps>(filter?: PropsFilter) => {
    if (filter) {
      cache ??= new WeakMap();
      if (!cache.has(filter)) {
        cache.set(filter, <T>(props: T) => filterProps(props, filter));
      }
      return cache.get(filter) as (props: TProps) => TProps;
    }
    return undefined;
  };
})();
