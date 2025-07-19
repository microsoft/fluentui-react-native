import { getMemoCache } from './getMemoCache';
import type { AnyFunction } from '../types';

/**
 * This wraps a function to memoize the results using the standard javascript memoization pattern
 * @param fn - function to memoize
 */
export function memoize<T>(fn: AnyFunction<T>): AnyFunction<T> {
  // create a unique cache that will be captured in the closure
  const cache = getMemoCache();
  // create the closure which wraps the calling function
  const closure: AnyFunction<T> = (...args) => {
    return cache(() => fn(...args), args)[0];
  };
  // now return that closure strongly typed as the function.
  return closure;
}
