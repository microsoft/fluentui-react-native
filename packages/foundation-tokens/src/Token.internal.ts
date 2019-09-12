/**
 * Internal types used by the tokens module.  Separated to keep the .types file a bit cleaner
 */

export interface ICacheInfo {
  /** string to prepend for cache lookups */
  prefix: string;

  /** cache to use for looking up the cache entry */
  cache: object;

  /** for web name of the object to name created styles */
  displayName?: string;
}

export interface ITokenPropInfo<TProps> {
  /** token props, aggregated from settings and user props */
  tokens: TProps;

  /** just the token props where a user prop has overridden what came from settings */
  deltas: TProps | undefined;

  /** props object to use as a clearing mask for the root slot */
  tokenKeys: { [key: string]: undefined };
}

export type IGetCachedPropsForSlot<TProps, TTheme> = (
  props: TProps,
  tokenProps: ITokenPropInfo<TProps>,
  theme: TTheme,
  slotName: string,
  cacheInfo: ICacheInfo
) => TProps;

export interface ICachedPropHandlers<TProps, TTheme> {
  root: IGetCachedPropsForSlot<TProps, TTheme>;
  [key: string]: IGetCachedPropsForSlot<TProps, TTheme>;
}
