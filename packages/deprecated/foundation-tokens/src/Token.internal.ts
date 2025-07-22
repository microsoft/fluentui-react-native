import type { GetMemoValue } from '@fluentui-react-native/framework-base';

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
  getMemoValue: GetMemoValue,
) => TProps;

export type ICachedPropHandlers<TSlotProps extends object, TTokens, TTheme> = {
  [K in keyof TSlotProps]: IGetCachedPropsForSlot<TSlotProps[K], TTokens, TTheme>;
};
