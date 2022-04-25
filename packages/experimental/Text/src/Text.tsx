/** @jsx withSlots */
import {
  fontStyles,
  withSlots,
  UseTokens,
  useFluentTheme,
  mergeStyles,
  compressible,
  patchTokens,
} from '@fluentui-react-native/framework';
import { Text as RNText } from 'react-native';
import { textName, TextProps, useTextTokens, TextTokens } from './Text.types';
import React from 'react';


export const Text = compressible<TextProps, TextTokens>((props: TextProps, useTokens: UseTokens<TextTokens>) => {
  // split out color and variant from props
  const {color, variant, style, ...rest } = props;
  const theme = useFluentTheme();
  // get the tokens from the theme
  let [tokens, cache] = useTokens(theme);

  // override variant or color from props
  [tokens, cache] = patchTokens(tokens, cache, { color, variant });

  // now build the text style from tokens that can be shared between different Text instances
  const [tokenStyle] = cache(
    () => ({
      margin: 0,
      color: tokens.color,
      ...fontStyles.from(tokens, theme),
    }),
    ['color', ...fontStyles.keys],
  );

  // return a continuation function that allows this text to be compressed
  return (extra: TextProps, children: React.ReactNode) => {
    const mergedProps = { ...rest, ...extra, style: mergeStyles(tokenStyle, props.style, extra?.style) };
    return <RNText {...mergedProps}>{children}</RNText>;
  };
}, useTextTokens);
Text.displayName = textName;

export default Text;
