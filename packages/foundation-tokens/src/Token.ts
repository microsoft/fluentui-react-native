import { ITokenOperation, ITokenOperations, ITokenProcessor, IComponentTokens } from './Token.types';
import { ISlotProps, mergeSettings, IComponentSettings } from '@uifabric/theme-settings';

/**
 * Run through the token processor array and build up a set of slot props to merge together
 *
 * @param props - props which contain token values
 * @param theme - theme used to look up styling values
 * @param tokens - token processor array
 */
function _resolveTokens<TProps, TTheme>(props: TProps, theme: TTheme, tokens: ITokenProcessor<TProps, TTheme>[]): IComponentSettings[] {
  return tokens.map((processor: ITokenProcessor<TProps, TTheme>) => {
    return processor(props, theme);
  });
}

/**
 * Apply any tokens from settings
 * @param props - mutable props object which has props from the user and will be augmented from settings
 * @param rootSlotProps - root slot props which will have tokens sources from settings
 * @param keys - array of prop keys which should be considered tokens
 */
function _prepareTokenProps<TProps>(
  props: TProps,
  rootSlotProps: object,
  keys: Map<string, boolean>
): { cacheString: string; clearTokenSettings?: IComponentSettings } {
  const cacheKeys: string[] = [];
  const clearTokens = {};
  const clearTokenSettings = { root: clearTokens };
  rootSlotProps = rootSlotProps || {};
  keys.forEach((_val: boolean, key: string) => {
    if (props.hasOwnProperty(key) && rootSlotProps[key] !== props[key]) {
      // in this case the user has specified this token and it is different than what came from settings
      // as a result this token becomes a key for looking up the resulting items
      cacheKeys.push(String(props[key]));
    } else {
      // in this case it is not a cache key so just add a separator (to avoid 'red', undefined equaling undefined, 'red')
      cacheKeys.push('');
      // if the token is actually set on rootSlotProps then put it into props
      if (rootSlotProps.hasOwnProperty(key)) {
        props[key] = rootSlotProps[key];
      }
    }
    clearTokens[key] = undefined;
  });
  return { cacheString: cacheKeys.join('-'), clearTokenSettings };
}

/**
 * Run through the end to end token workflow for render.  This will resolve the tokens and attempt to preempt style creation
 * by referencing values in the cache
 *
 * @param props - user props passed in and copied into a mutable object, these have precedence
 * @param theme - theme to get styling info from
 * @param slotProps - starting slotProps, the root entry may have token defaults filled in
 * @param tokens - the array of token processors
 * @param tokenKeys - the combined set of token keys referenced by the processors
 * @param baseCacheKey - cache key to append token info to, this generally refers to the settings
 * @param cache - cache which holds the slotProps if they have been built before
 */
export function processTokens<TProps, TTheme>(
  props: TProps,
  theme: TTheme,
  slotProps: IComponentSettings,
  tokenInfo: IComponentTokens<TProps, TTheme>,
  baseCacheKey: string,
  cache: object
): ISlotProps {
  // merge in tokens and build up the cache key which are the tokens overridden by the user
  const { cacheString, clearTokenSettings } = _prepareTokenProps(props, slotProps.root, tokenInfo.tokenKeys);
  const cacheKey = baseCacheKey + cacheString;

  // if this is not already cached there is work to do
  if (!cache[cacheKey]) {
    // run through the tokens and build a list of slotProps to merge together
    const propsToMerge = _resolveTokens(props, theme, tokenInfo.tokens) || [];
    // merge the settings and cache them
    cache[cacheKey] = mergeSettings(slotProps, ...propsToMerge, clearTokenSettings);
  }

  // return the cache entry
  return cache[cacheKey];
}

/**
 * A simple decorator function to make inputting the token entries cleaner looking.
 * @param processor - processor to use
 * @param targets - target slots
 */
export function token<TProps, TTheme>(mapping: ITokenOperation<TProps, TTheme>[], ...slots: string[]): ITokenOperations<TProps, TTheme> {
  return { mapping, slots };
}
