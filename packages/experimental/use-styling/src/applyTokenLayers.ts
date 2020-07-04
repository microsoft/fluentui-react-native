import { GetMemoValue } from '@fluentui-react-native/memo-cache';
import { immutableMerge } from '@uifabricshared/immutable-merge';

/**
 * Pattern for applying extra layers to an object with a precedence array determining the order of application
 */
export type WithLayers<T> = T & {
  layers?: {
    [layer: string]: WithLayers<T>;
  };
  precedence?: string[];
};

/**
 * alternatively look them up with a passed in function
 */
export type HasLayer = (name: string) => boolean;

/**
 * Apply token layers, building them up applied layer by applied layer, using the cache to store intermediate
 * values
 *
 * @param tokens - input tokens which may have layers to apply
 * @param subCache - cache scoped to the root object with no layers applied
 * @param hasLayer - a function which returns whether a given layer should be applied
 */
export function applyTokenLayers<TTokens>(
  tokens: WithLayers<TTokens>,
  subCache: GetMemoValue<TTokens>,
  hasLayer: HasLayer
): [TTokens, GetMemoValue<TTokens>] {
  type TokensAndCache = { tokens: WithLayers<TTokens>; subCache: GetMemoValue<WithLayers<TTokens>> };
  let final: TokensAndCache = { tokens, subCache };
  if (tokens.precedence) {
    // now walk the overrides that are set, merging in props, caching results, and getting a new sub cache
    final = tokens.precedence
      .filter(val => hasLayer(val))
      .reduce((previous: TokensAndCache, layer: string) => {
        const layers = previous.tokens.layers || {};
        const [tokens, subCache] = previous.subCache(
          () => (layers[layer] ? immutableMerge(previous.tokens, layers[layer]) : previous.tokens),
          [layer]
        );
        return { tokens, subCache };
      }, final);
  }
  return [final.tokens, final.subCache];
}
