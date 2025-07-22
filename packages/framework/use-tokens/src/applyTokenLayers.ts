import { immutableMerge } from '@fluentui-react-native/framework-base';
import type { GetTypedMemoValue } from '@fluentui-react-native/framework-base';

/**
 * alternatively look them up with a passed in function
 */
export type HasLayer = (name: string) => boolean;

/**
 * Apply token layers, building them up applied layer by applied layer, using the cache to store intermediate
 * values
 *
 * @param tokens - input tokens which may have layers to apply
 * @param states - array of states to check for, ordered by precedence
 * @param subCache - cache scoped to the root object with no layers applied
 * @param hasLayer - a function which returns whether a given layer should be applied
 */
export function applyTokenLayers<TTokens>(
  tokens: TTokens,
  states: string[],
  subCache: GetTypedMemoValue<TTokens>,
  hasLayer: HasLayer,
): [TTokens, GetTypedMemoValue<TTokens>] {
  type TokensAndCache = { tokens: TTokens; subCache: GetTypedMemoValue<TTokens> };
  let final: TokensAndCache = { tokens, subCache };
  if (states && states.length > 0) {
    // now walk the overrides that are set, merging in props, caching results, and getting a new sub cache
    final = states
      .filter((val) => hasLayer(val))
      .reduce((previous: TokensAndCache, layerName: string) => {
        const layer = previous.tokens[layerName];
        const [tokens, subCache] = previous.subCache(
          () => (layer && typeof layer === 'object' ? immutableMerge(previous.tokens, layer) : previous.tokens),
          [layer],
        );
        return { tokens, subCache };
      }, final);
  }
  return [final.tokens, final.subCache];
}
