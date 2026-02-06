import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';

import type { Theme } from '@fluentui-react-native/theme-types';

export type TokenBuilder<TTokens, TStyle extends ViewStyle | TextStyle | ImageStyle> = {
  from: (tokens: TTokens, theme: Theme) => TStyle;
  keys: (keyof TTokens)[];
};

export function tokenBuilder<TTokens, TStyle extends ViewStyle | TextStyle | ImageStyle>(
  ...keys: (keyof TTokens)[]
): TokenBuilder<TTokens, TStyle> {
  const from = (tokens: TTokens, _theme: Theme): TStyle => {
    const style = {} as TStyle;
    for (const key of keys) {
      const value = tokens[key];
      if (value !== undefined) {
        style[key as string] = value;
      }
    }
    return style;
  };
  return { from, keys };
}
