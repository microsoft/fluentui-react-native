/**
 * This is a copy of the react-native style prop type, copied here to avoid RN dependencies this early in the dependency tree.
 */
type Falsy = undefined | null | false | '';
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface RecursiveArray<T> extends Array<T | ReadonlyArray<T> | RecursiveArray<T>> {}
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
