import { getMemoCache } from './getMemoCache';

/**
 * This wraps a function to memoize the results using the standard javascript memoization pattern
 * @param fn - function to memoize
 */
export function memoize<T extends Function>(fn: T): T {
  // create a unique cache that will be captured in the closure
  const cache = getMemoCache<any>();
  // create the closure which wraps the calling function
  const closure = (...args: any[]) => {
    return cache(() => fn(...(args || [])), args)[0];
  };
  // now return that closure strongly typed as the function.
  return (closure as unknown) as T;
}
