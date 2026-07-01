import { DistributiveOmit } from './utility.types';

/**
 * This is a copy of the react-native style prop type, copied here to avoid RN dependencies this early in the dependency tree.
 */
type Falsy = undefined | null | false | '';
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface RecursiveArray<T> extends Array<T | readonly T[] | RecursiveArray<T>> {}
/** Keep a brand of 'T' so that calls to `StyleSheet.flatten` can take `RegisteredStyle<T>` and return `T`. */
type RegisteredStyle<T> = number & { __registeredStyleBrand: T };
export type StyleProp<T> = T | RegisteredStyle<T> | RecursiveArray<T | RegisteredStyle<T> | Falsy> | Falsy;

/**
 * This is the baseline for acceptance object types, meaning for T extends ObjectBase. The options here
 * are:
 * - {} an empty object, which works but is a bit too loose for general use
 * - Record<string, unknown> which is fine with types but doesn't work with
 *   interfaces as they have no implicit index signature
 * - object which is the built in object type, slightly stricter than {} but still allows for interfaces
 *
 * There's no perfect option here but object is the best overall choice.
 */
export type ObjectBase = object;

/**
 * For fallback object types it is better to use the stricter Record<string, unknown> type, as it
 * is more likely to catch issues with unexpected properties and is still compatible with the
 * ObjectBase type.
 */
export type ObjectFallback = Record<string, unknown>;

/**
 * Get the props from a react component type
 */
export type PropsOf<TComponent> = TComponent extends React.JSXElementConstructor<infer P> ? P : never;

/**
 * Removes the 'ref' prop from the given Props type, leaving unions intact (such as the discriminated union created by
 * IntrinsicSlotProps). This allows IntrinsicSlotProps to be used with React.forwardRef.
 */
export type PropsWithoutRef<P> = 'ref' extends keyof P ? DistributiveOmit<P, 'ref'> : P;

/**
 * Removes the 'children' prop from the given Props type, leaving unions intact (such as the discriminated union created by
 * IntrinsicSlotProps). This allows IntrinsicSlotProps to be used with React.forwardRef.
 */
export type PropsWithoutChildren<P> = 'children' extends keyof P ? DistributiveOmit<P, 'children'> : P;

/**
 * A signature for a property filter function.
 * @param propName - The name of a property to test.
 * @returns A boolean indicating whether the property is valid. true if valid, false if should be filtered out.
 */
export type PropsFilter = (propName: string) => boolean;

/**
 * Overloaded function types for an object merger, similar to Object.assign but with better type inference and support for
 * undefined values.
 */
export type ObjectMerger = {
  // T1 defined overloads
  <T1>(o1: T1, ...objs: undefined[]): T1;
  <T1, T2>(o1: T1, o2: T2, ...objs: undefined[]): T1 & T2;
  <T1, T2, T3>(o1: T1, o2: T2, o3: T3, ...objs: undefined[]): T1 & T2 & T3;
  // T1 undefined overloads
  <T2>(o1: undefined, o2: T2, ...objs: undefined[]): T2;
  <T2, T3>(o1: undefined, o2: T2, o3: T3, ...objs: undefined[]): T2 & T3;
  // T2 undefined overload
  <T1, T3>(o1: T1, o2: undefined, o3: T3, ...objs: undefined[]): T1 & T3;
  // rest overloads
  <T = ObjectFallback>(...objs: unknown[]): T | undefined;
};

/**
 * Overloaded function types for an object merger that takes options, similar to Object.assign but with better type inference and support for
 * undefined values, and with an options parameter to control merge behavior.
 */
export type ObjectMergerWithOptions<TOptions> = {
  // T1 defined overloads
  <T1>(opt: TOptions, o1: T1, ...objs: undefined[]): T1;
  <T1, T2>(opt: TOptions, o1: T1, o2: T2, ...objs: undefined[]): T1 & T2;
  <T1, T2, T3>(opt: TOptions, o1: T1, o2: T2, o3: T3, ...objs: undefined[]): T1 & T2 & T3;
  // T1 undefined overloads
  <T2>(opt: TOptions, o1: undefined, o2: T2, ...objs: undefined[]): T2;
  <T2, T3>(opt: TOptions, o1: undefined, o2: T2, o3: T3, ...objs: undefined[]): T2 & T3;
  // T2 undefined overload
  <T1, T3>(opt: TOptions, o1: T1, o2: undefined, o3: T3, ...objs: undefined[]): T1 & T3;
  // rest overloads
  <T = ObjectFallback>(opt: TOptions, ...objs: unknown[]): T | undefined;
};

/**
 * Overloaded function types for a style merger, which is similar to an object merger but specifically for merging styles that may be in the form of StyleProp types.
 * This includes support for merging styles of different types, which is useful when merging token-based styles with React Native StyleProp types.
 */
export type StyleMerger = {
  // T1 defined overloads
  <T1>(o1: StyleProp<T1>, ...objs: undefined[]): T1;
  <T1, T2>(o1: StyleProp<T1>, o2: StyleProp<T2>, ...objs: undefined[]): T1 & T2;
  <T1, T2, T3>(o1: StyleProp<T1>, o2: StyleProp<T2>, o3: StyleProp<T3>, ...objs: undefined[]): T1 & T2 & T3;
  // T1 undefined overloads
  <T2>(o1: StyleProp<undefined>, o2: StyleProp<T2>, ...objs: undefined[]): T2;
  <T2, T3>(o1: StyleProp<undefined>, o2: StyleProp<T2>, o3: StyleProp<T3>, ...objs: undefined[]): T2 & T3;
  // T2 undefined overload
  <T1, T3>(o1: StyleProp<T1>, o2: StyleProp<undefined>, o3: StyleProp<T3>, ...objs: undefined[]): T1 & T3;
  // rest overloads
  <T = ObjectFallback>(...objs: unknown[]): T | undefined;
};
