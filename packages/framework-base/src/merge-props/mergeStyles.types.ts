/**
 * This is a copy of the react-native style prop type, copied here to avoid RN dependencies for web clients
 */
type Falsy = undefined | null | false | '' | 0;
type RecursiveArray<T> = readonly (T | RecursiveArray<T>)[] | (T | RecursiveArray<T>)[];
/** Keep a brand of 'T' so that calls to `StyleSheet.flatten` can take `RegisteredStyle<T>` and return `T`. */
type RegisteredStyle<T> = number & { __registeredStyleBrand: T };

export type StyleProp<T> = T | RegisteredStyle<T> | RecursiveArray<T | RegisteredStyle<T> | Falsy> | Falsy;
