import { ISlotProps } from '@uifabricshared/foundation-settings';

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

export interface ITokenPropInfo<TTokens> {
  /** token props, aggregated from settings and user props */
  tokens: TTokens;

  /** just the token props where a user prop has overridden what came from settings */
  deltas: TTokens | undefined;

  /** props object to use as a clearing mask for the root slot */
  tokenKeys: { [key: string]: undefined };
}

export type IGetCachedPropsForSlot<TProps, TTokens, TTheme> = (
  props: TProps,
  tokenProps: ITokenPropInfo<TTokens>,
  theme: TTheme,
  slotName: string,
  cacheInfo: ICacheInfo
) => TProps;

export type ICachedPropHandlers<TSlotProps extends ISlotProps, TTokens, TTheme> = {
  [K in keyof TSlotProps]: IGetCachedPropsForSlot<TSlotProps[K], TTokens, TTheme>;
};
