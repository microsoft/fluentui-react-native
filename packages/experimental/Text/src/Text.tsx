/** @jsx withSlots */
import {
  FontTokens,
  FontVariantTokens,
  fontStyles,
  withSlots,
  buildUseTokens,
  UseTokens,
  useFluentTheme,
  applyTokenLayers,
  mergeStyles,
  compressible,
  patchTokens,
} from '@fluentui-react-native/framework';
import { Text as RNText, ColorValue } from 'react-native';
import { ITextProps } from '@fluentui-react-native/adapters';
import React from 'react';

const textName = 'Text';

/**
 * Text tokens, these are the internally configurable values for Text elements. In particular these
 * drive decisions on how to build the styles
 */
export interface TextTokens extends FontTokens {
  /** foreground text color */
  color?: ColorValue;

  /** alternate mode for disabled look and feel */
  disabled?: TextTokens;
}

/**
 * Text props, based off of the standard react-native TextProps with some new extensions
 */
export type TextProps<TBase = ITextProps> = TBase &
  FontVariantTokens & {
    /** foreground text color */
    color?: ColorValue;

    /** whether or not this text should be presented as disabled */
    disabled?: boolean;
  };

const useTextTokens = buildUseTokens<TextTokens>(
  (t) => ({
    variant: 'secondaryStandard',
    color: t.colors.bodyText,
    disabled: {
      color: t.colors.disabledText,
    },
  }),
  textName,
);

export const Text = compressible<TextProps, TextTokens>((props: TextProps, useTokens: UseTokens<TextTokens>) => {
  // split out color and variant from props
  const { color, variant, style, disabled, ...rest } = props;
  const theme = useFluentTheme();
  // get the tokens from the theme
  let [tokens, cache] = useTokens(theme);

  // apply states like disabled if specified in props
  [tokens, cache] = applyTokenLayers(tokens, ['disabled'], cache, (state) => props[state]);
  // override variant or color from props
  [tokens, cache] = patchTokens(tokens, cache, { color, variant });

  // now build the text style from tokens that can be shared between different Text instances
  const [tokenStyle] = cache(
    () => ({
      margin: 0,
      color: tokens.color,
      ...fontStyles.from(tokens, theme),
    }),
    [],
  );

  // return a continuation function that allows this text to be compressed
  return (extra: TextProps, children: React.ReactNode) => {
    const mergedProps = { ...rest, ...extra, style: mergeStyles(tokenStyle, props.style, extra.style) };
    return <RNText {...mergedProps}>{children}</RNText>;
  };
}, useTextTokens);
Text.displayName = textName;

export default Text;
