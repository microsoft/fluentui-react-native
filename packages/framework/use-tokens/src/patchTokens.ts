import type { GetTypedMemoValue } from '@fluentui-react-native/framework-base';

/**
 * Take a set of tokens (and a memo-cache) and apply changes to those tokens from an additional set of tokens. Only keys which are
 * not undefined will be applied and if no changes are detected the token object will be unchanged.
 *
 * @param tokens - base set of tokens to apply changes to, this will not be modified
 * @param cache - cache corresponding to this set of tokens
 * @param patchValues - new values to apply, values will be obtained via keys in the object
 * @returns - a tuple consisting of a new tokens object and a new memo-cache
 */
export function patchTokens<TTokens>(
  tokens: TTokens,
  cache: GetTypedMemoValue<TTokens>,
  patchValues: TTokens,
): [TTokens, GetTypedMemoValue<TTokens>] {
  // reduce the patch values to the set of keys that are defined, and sort them to ensure consistent ordering
  const keys = Object.keys(patchValues)
    .filter((v) => patchValues[v] !== undefined)
    .sort();

  // for each key get an updated tokens collection based on key + value. Value alone isn't sufficient as the values
  // are not necessarily unique. i.e. { a: 'blue' } and { b: 'blue' } would cache to the same without the key
  for (const key of keys) {
    [tokens, cache] = cache(() => ({ ...tokens, [key]: patchValues[key] }), [key, patchValues[key]]);
  }

  // return the updated tokens and cache (if there were any keys applied)
  return [tokens, cache];
}
