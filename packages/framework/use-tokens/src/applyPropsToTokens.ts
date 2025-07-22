import type { GetTypedMemoValue } from '@fluentui-react-native/framework-base';

export function applyPropsToTokens<TProps, TTokens>(
  props: TProps,
  tokens: TTokens,
  cache: GetTypedMemoValue<TTokens>,
  keys: (keyof TTokens)[],
): [TTokens, GetTypedMemoValue<TTokens>] {
  for (const key of keys) {
    const sourceValue = props[key as string];
    const setValue = sourceValue === tokens[key] ? undefined : sourceValue;
    [tokens, cache] = cache(() => (setValue === undefined ? tokens : { ...tokens, [key]: setValue }), [setValue]);
  }
  return [tokens, cache];
}
