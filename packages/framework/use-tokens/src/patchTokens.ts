import { GetMemoValue } from '@fluentui-react-native/memo-cache';

export function patchTokens<TTokens>(
  tokens: TTokens,
  cache: GetMemoValue<TTokens>,
  patchValues: TTokens,
): [TTokens, GetMemoValue<TTokens>] {
  // reduce the patch values to the set of keys that are defined, and sort them to ensure consistent ordering
  const keys = Object.keys(patchValues)
    .filter((v) => v !== undefined)
    .sort();

  // for each key get an updated tokens collection based on key + value. Value alone isn't sufficient as the values
  // are not necessarily unique. i.e. { a: 'blue' } and { b: 'blue' } would cache to the same without the key
  for (const key of keys) {
    [tokens, cache] = cache(() => ({ ...tokens, [key]: patchValues[key] }), [key, patchValues[key]]);
  }

  // return the updated tokens and cache (if there were any keys applied)
  return [tokens, cache];
}
