/* eslint-disable */

/** typescript shorthand for excluding a key from an interface */
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

/** Extract from T those types that are assignable to U */
export type Extract<T, U> = T extends U ? T : never;

/** Extract from T based on expected with an alternate */
export type ExtractProp<T, U = object, TUnset = object> = T extends U ? T : TUnset;

/** Exclude from T those types that are assignable to U */
export type Exclude<T, U> = T extends U ? never : T;

/** Test for never, return TToSet if not never, TNeverVal if the type is never */
export type NonNever<TObj, TToSet, TNeverVal = object> = [TObj] extends [never] ? TNeverVal : TToSet;

/** Iterate through keys of object which are objects */
export function iterObj(target: object, fn: (obj: object, key: string) => void): void {
  for (const targetKey in target) {
    if (target.hasOwnProperty(targetKey) && typeof target[targetKey] === 'object') {
      fn(target[targetKey], targetKey);
    }
  }
}
