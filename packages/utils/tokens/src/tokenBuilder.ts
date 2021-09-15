import { Theme } from '@fluentui-react-native/theme-types';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

export type TokenBuilder<TTokens> = {
  from: (tokens: TTokens, theme: Theme) => ViewStyle | TextStyle | ImageStyle;
  keys: (keyof TTokens)[];
};

export function tokenBuilder<TTokens>(...keys: (keyof TTokens)[]): TokenBuilder<TTokens> {
  const from = (tokens: TTokens) => {
    const style = {};
    keys
      .filter(key => tokens[key] !== undefined)
      .forEach(key => {
        style[key as string] = tokens[key];
      });
    return style;
  };
  return { from, keys };
}
