/** @jsx withSlots */
import {
  fontStyles,
  withSlots,
  UseTokens,
  useFluentTheme,
  mergeStyles,
  compressible,
  patchTokens,
  FontWeightValue,
  FontFamilyValue,
} from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { I18nManager, Text as RNText } from 'react-native';
import { textName, TextProps, TextTokens } from './Text.types';
import { useTextTokens } from './TextTokens';
import React from 'react';

export const Text = compressible<TextProps, TextTokens>((props: TextProps, useTokens: UseTokens<TextTokens>) => {
  // split out color and variant from props
  const {
    align,
    block,
    color,
    italic,
    size,
    strikethrough,
    style,
    font,
    truncate = false,
    underline,
    variant = 'secondaryStandard',
    weight,
    wrap = true,
    ...rest
  } = props;
  const theme = useFluentTheme();
  // get the tokens from the theme
  let [tokens, cache] = useTokens(theme);

  let fontFamily = globalTokens.font.family['base'] as FontFamilyValue;
  switch (font) {
    case 'monospace':
      fontFamily = globalTokens.font.family['monospace'];
      break;
    case 'numeric':
      fontFamily = globalTokens.font.family['numeric'];
      break;
    default:
      fontFamily = globalTokens.font.family['base'];
      break;
  }

  const textAlign = I18nManager.isRTL ? (align == 'start' ? 'right' : align == 'end' ? 'left' : align) : (align == 'start' ? 'left' : align == 'end' ? 'right' : align);


  // override tokens from props
  [tokens, cache] = patchTokens(tokens, cache, {
    color,
    variant,
    fontSize: globalTokens.font.size[size],
    fontWeight: globalTokens.font.weight[weight] as FontWeightValue,
    fontStyle: props.italic ? 'italic' : 'normal',
    textAlign: textAlign,
    textDecorationLine:
      underline && strikethrough ? 'underline line-through' : underline ? 'underline' : strikethrough ? 'line-through' : 'none',
  });

  // now build the text style from tokens that can be shared between different Text instances
  const [tokenStyle] = cache(
    () => ({
      margin: 0,
      color: tokens.color,
      fontStyle: tokens.fontStyle,
      textAlign: tokens.textAlign,
      textDecorationLine: tokens.textDecorationLine,
      fontSize: tokens.fontSize,
      fontWeight: tokens.fontWeight,
      fontFamily: fontFamily,
      ...fontStyles.from(tokens, theme),
    }),
    ['color', 'fontStyle', 'textAlign', 'textDecorationLine', ...fontStyles.keys],
  );

  // return a continuation function that allows this text to be compressed
  return (extra: TextProps, children: React.ReactNode) => {
    const mergedProps = {
       numberOfLines: truncate || !wrap ? 1 : 0,
      ...rest,
      ...extra,
      style: mergeStyles(tokenStyle, props.style, extra?.style)
    };
    return <RNText {...mergedProps}>{children}</RNText>;
  };
}, useTextTokens);
Text.displayName = textName;

export default Text;
