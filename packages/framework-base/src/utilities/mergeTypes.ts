import type { StyleProp, ObjectFallback } from './baseTypes.ts';

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
