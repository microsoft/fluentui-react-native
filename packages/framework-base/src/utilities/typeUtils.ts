import type React from 'react';
import type { PropsWithChildren } from 'react';
import type { DistributiveOmit, DistributivePick } from '../types/utility.types.ts';
import type { PropsWithoutChildren } from '../types/props.types.ts';

/**
 *
 */
export type TypeofResult = 'undefined' | 'object' | 'boolean' | 'number' | 'string' | 'symbol' | 'bigint' | 'function';
export type ExpandedTypeof = TypeofResult | 'array' | 'null';

/**
 * Provide a more sensible type result that expands upon the built in typeof operator
 * In particular this will differentiate arrays and nulls from standard objects
 * @param val - value to check type
 */
export function getEntityType(val: unknown): ExpandedTypeof {
  switch (typeof val) {
    case 'object':
      if (val === null) {
        return 'null';
      } else if (Array.isArray(val)) {
        return 'array';
      }
      return 'object';
    default:
      return typeof val as TypeofResult;
  }
}

/**
 * Assertion function for types related to objects (objects with string keys and some value types).
 * This is used to narrow down types in situations where we want to ensure we are working with a plain
 * object and not something else (like an array or null).
 * @param value some value of unknown type
 * @returns an assertion that the value is an object with string keys and unknown values (not an array or null)
 */
export function isObject<T extends Record<string | symbol, unknown>>(value: unknown): value is T {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getPropSubset<TProps>(props: TProps, keys: Extract<keyof TProps, string>[]): Partial<TProps> | undefined {
  let result: Partial<TProps> | undefined = undefined;
  if (isObject(props)) {
    for (const key of keys) {
      if (key in props) {
        result ??= {};
        result[key] = props[key];
      }
    }
  }
  return result;
}

export function getPropsWithoutSubset<TProps>(props: TProps, keys: Extract<keyof TProps, string>[]): Partial<TProps> | undefined {
  const result = {} as TProps;
  if (isObject(props)) {
    for (const key in props) {
      if (!keys.includes(key as Extract<keyof TProps, string>)) {
        result[key as keyof TProps] = props[key] as TProps[keyof TProps];
      }
    }
  }
  return result;
}

export function splitProps<TProps>(props: TProps, keys: Extract<keyof TProps, string>[]): [TProps, Partial<TProps> | undefined] {
  const split = getPropSubset(props, keys);
  if (split) {
    return [getPropsWithoutSubset(props, keys) as TProps, split];
  }
  return [props, undefined];
}

export function splitAndOmitProp<TProps, K extends keyof TProps>(
  props: TProps,
  key: K,
): [DistributiveOmit<TProps, K>, DistributivePick<TProps, K> | undefined] {
  type ResultType = ReturnType<typeof splitAndOmitProp<TProps, K>>;

  const extractedKey = key as unknown as Extract<keyof TProps, string>;
  const split = getPropSubset(props, [extractedKey]) as ResultType[1];
  if (split) {
    return [getPropsWithoutSubset(props, [extractedKey]) as ResultType[0], split];
  }
  return [props as ResultType[0], undefined];
}

/**
 * Helper to split props into children and non-children props.
 * @param props unknown props type object to split
 * @returns a tuple of the non-children props and the children
 */
export function splitPropsAndChildren<TProps>(props: TProps): [PropsWithoutChildren<TProps>, { children?: React.ReactNode } | undefined] {
  const [nonChildrenProps, childrenProps] = splitAndOmitProp(props as PropsWithChildren<TProps>, 'children');
  return [nonChildrenProps as PropsWithoutChildren<TProps>, childrenProps];
}

/**
 * Helper to get the children from an unknown props type object.
 */
export function getPropsChildren<TProps>(props: TProps): React.ReactNode | undefined {
  return (props as PropsWithChildren<TProps>).children;
}
