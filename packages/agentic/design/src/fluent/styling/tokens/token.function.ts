import type { StyleFactoryFunction, StyleFactoryFunctionRaw } from './token.types';

/**
 * Helper to make it easy to create a style factory function.  Function statics are super convenient
 * but kind of annoying to set up
 *
 * @param fn - function to decorate with keys
 * @param keys - keys to append as a static to the function
 */
export function styleFunction<TProps, TTokens, TTheme>(
  fn: StyleFactoryFunctionRaw<TProps, TTokens, TTheme>,
  keys: (keyof TTokens)[],
): StyleFactoryFunction<TProps, TTokens, TTheme> {
  (fn as StyleFactoryFunction<TProps, TTokens, TTheme>)._keys = keys;
  return fn as StyleFactoryFunction<TProps, TTokens, TTheme>;
}
