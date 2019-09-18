/**
 * This is a copy of the react-native style prop type, copied here to avoid RN dependencies for web clients
 */
type Falsy = undefined | null | false;
interface RecursiveArray<T> extends Array<T | RecursiveArray<T>> { }
/** Keep a brand of 'T' so that calls to `StyleSheet.flatten` can take `RegisteredStyle<T>` and return `T`. */
type RegisteredStyle<T> = number & { __registeredStyleBrand: T };
export type IStyleProp<T> = T | RegisteredStyle<T> | RecursiveArray<T | RegisteredStyle<T> | Falsy> | Falsy;

/**
 * Function to process a style and resolve any keys.  The flattened style will be passed in.  The function should
 * return an object to merge with the prior style, keys that are specified but undefined will be deleted.  If
 * no changes need to be made an empty object or undefined should be returned.
 */
export type IFinalizeStyle = (target: object) => object | undefined;
