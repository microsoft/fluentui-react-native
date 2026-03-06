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
export function isObject<T extends Record<string, unknown>>(value: unknown): value is T {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Helper to split props into children and non-children props.
 * @param props unknown props type object to split
 * @returns a tuple of the non-children props and the children
 */
export function splitPropsAndChildren<TProps>(props: TProps): [Omit<TProps, 'children'>, React.ReactNode] {
  const { children, ...rest } = props as React.PropsWithChildren<TProps>;
  return [rest as Omit<TProps, 'children'>, children];
}

/**
 * Helper to get the children from an unknown props type object.
 */
export function extractChildren<TProps>(props: TProps): React.ReactNode {
  const { children } = props as React.PropsWithChildren<TProps>;
  return children;
}
