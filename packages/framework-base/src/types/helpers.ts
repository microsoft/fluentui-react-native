/**
 * Helper type that works similar to Omit,
 * but when modifying an union type it will distribute the omission to all the union members.
 *
 * See [distributive conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types) for more information
 */
// Traditional Omit is basically equivalent to => Pick<T, Exclude<keyof T, K>>
//
// let's say we have Omit<{ a: string } | { b: string }, 'a'>
// equivalent to: Pick<{ a: string } | { b: string }, Exclude<keyof ({ a: string } | { b: string }), 'a'>>
// The expected result would be {} | { b: string }, the omission of 'a' from all the union members,
// but keyof ({ a: string } | { b: string }) is never as they don't share common keys
// so  Exclude<never, 'a'> is never,
// and Pick<{ a: string } | { b: string }, never> is {}.
//
// With DistributiveOmit on the other hand it becomes like this:
// DistributiveOmit<{ a: string } | { b: string }, 'a'>
// equivalent to: Omit<{ a: string }, 'a'> | Omit<{ b: string }, 'a'>
// Since every single Omit clause in this case is being applied to a single union member there's no conflicts on keyof evaluation and in the second clause Omit<{ b: string }, 'a'> becomes { b: string },
// so the result is {} | { b: string }, as expected.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : T;

/**
 * Helper type that works similar to Pick,
 * but when modifying an union type it will distribute the picking to all the union members.
 *
 * See {@link https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types} for more information
 *
 * @public
 */
export type DistributivePick<T, K> = T extends unknown ? Pick<T, K & keyof T> : never;

/**
 * Converts a union type (`A | B | C`) to an intersection type (`A & B & C`)
 */
export type UnionToIntersection<U> = (U extends unknown ? (x: U) => U : never) extends (x: infer I) => U ? I : never;

/**
 * If type T includes `null`, remove it and add `undefined` instead.
 *
 * @internal
 */
export type ReplaceNullWithUndefined<T> = T extends null ? Exclude<T, null> | undefined : T;

/**
 * Evaluates to true if the given type contains exactly one string, or false if it is a union of strings.
 *
 * ```
 * IsSingleton<'a'> // true
 * IsSingleton<'a' | 'b' | 'c'> // false
 * ```
 */
export type IsSingleton<T extends string> = { [K in T]: Exclude<T, K> extends never ? true : false }[T];

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
