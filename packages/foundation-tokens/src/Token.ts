import { IComponentTokens } from './Token.types';
import { ISlotProps, IComponentSettings } from '@uifabric/theme-settings';
import { ITokenPropInfo, ICacheInfo } from './Token.internal';

/**
 * Take the input props and props from settings and return a merged set of token props (a single source
 * of truth) as well as an abbreviated collection with tokens that have been overridden from the user
 * props
 *
 * @param props - user props passed in to render
 * @param rootSlotProps - props for the root slot, this will have any tokens loaded from settings
 * @param tokenKeys - an object that contains the set of keys we care about for tokens on this component
 */
function _getTokenPropInfo<TProps>(props: TProps, rootSlotProps: object, tokenKeys: { [key: string]: undefined }): ITokenPropInfo<TProps> {
  const tokens = {} as TProps;
  const deltas = {} as TProps;
  for (const key in tokenKeys) {
    if (props.hasOwnProperty(key) || rootSlotProps.hasOwnProperty(key)) {
      const hasUser = props.hasOwnProperty(key);
      const token = (tokens[key] = hasUser ? props[key] : rootSlotProps[key]);
      if (hasUser && token !== rootSlotProps[key]) {
        deltas[key] = token;
      }
    }
  }
  return { tokens, deltas, tokenKeys };
}

/**
 * Run through the end to end token workflow for render.  This will resolve the tokens and attempt to preempt style creation
 * by referencing values in the cache
 *
 * @param props - user props passed in and copied into a mutable object, these have precedence
 * @param theme - theme to get styling info from
 * @param slotProps - starting slotProps, the root entry may have token defaults filled in
 * @param tokenInfo - the set of token props as well as the shortened set that have been overridden
 * @param prefix - cache key to append token info to, this generally refers to the settings
 * @param cache - cache which holds the slotProps if they have been built before
 * @param displayName - optional component display name, used for class building
 * @param finalizer - optional function to process styles before caching happens
 */
export function processTokens<TProps, TTheme>(
  props: TProps,
  theme: TTheme,
  slotProps: IComponentSettings,
  tokenInfo: IComponentTokens<TProps, TTheme>,
  prefix: string,
  cache: object,
  displayName?: string
): ISlotProps {
  // merge in tokens and build up the cache key which are the tokens overridden by the user
  slotProps = slotProps || {};
  const rootSlotProps = slotProps.root || {};
  const { handlers, tokenKeys } = tokenInfo;
  const tokenPropInfo = _getTokenPropInfo(props, rootSlotProps, tokenKeys);
  const cacheInfo: ICacheInfo = { cache, prefix, displayName };
  const resolvedSlotProps = {};

  Object.getOwnPropertyNames(handlers).forEach(slotName => {
    const handler = handlers[slotName];
    resolvedSlotProps[slotName] = handler(slotProps[slotName] || {}, tokenPropInfo, theme, slotName, cacheInfo);
  });

  // return the cache entry
  return resolvedSlotProps as ISlotProps;
}
