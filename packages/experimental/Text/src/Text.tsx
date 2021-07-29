/** @jsx withSlots */
import {
  compose,
  FontTokens,
  FontVariantTokens,
  UseSlots,
  buildProps,
  fontStyles,
  mergeProps,
  withSlots,
  Theme,
  buildUseTokens,
  UseTokens,
  useTheme,
  applyTokenLayers,
  mergeStyles,
} from '@fluentui-react-native/framework';
import { Text as RNText, ColorValue } from 'react-native';
import { filterTextProps, ITextProps } from '@fluentui-react-native/adapters';
import { applyPropsToTokens } from '@fluentui-react-native/use-tokens';
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

/**
 * These are the tokens which are also present in props. If specified in props this will override the values
 * from tokens.
 */
const tokensThatAreAlsoProps: (keyof TextTokens)[] = ['variant', 'color'];

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
  const { color, variant, style, ...rest } = props;
  const theme = useTheme();
  // get the tokens from the theme
  let [tokens, cache] = useTokens(theme);
  // apply states like disabled if specified in props
  [tokens, cache] = applyTokenLayers(tokens, ['disabled'], cache, (state) => props['state]']);
  // override variant or color from props
  [tokens, cache] = applyPropsToTokens({ color, variant }, tokens, cache, ['variant', 'color']);
  // now build the text style from tokens that can be shared between different Text instances
  const [tokenStyle] = cache(
    () => ({
      margin: 0,
      color: tokens.color,
      ...fontStyles.from(tokens, theme),
    }),
    [],
  );
  return (extra: TextProps, children: React.ReactNode) => {
    const mergedProps = { ...props, ...extra, style: mergeStyles(tokenStyle, props.style, extra.style) };
    return <RNText {...props}>{children}</RNText>;
  };
}, useTextTokens);

export const Text = compose<TextType>({
  displayName: textName,
  /** Settings for the use-styling hook */
  tokens: [
    (t) => ({
      variant: 'secondaryStandard',
      color: t.colors.bodyText,
      disabled: {
        color: t.colors.disabledText,
      },
    }),
    textName,
  ],
  states: ['disabled'],
  tokensThatAreAlsoProps,
  slotProps: {
    root: buildProps<ITextProps, TextTokens>(
      (tokens: TextTokens, theme: Theme) => ({
        style: {
          margin: 0,
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
  },
  /** Settings for the useSlots that will be passed on */
  slots: { root: RNText },
  filters: { root: filterTextProps },
  /** render function for the component */
  render: (props: TextProps, useSlots: UseSlots<TextType>) => {
    // stage one, execute any hooks, styling lookups to build the styled slot
    const Root = useSlots(props).root;
    // return a function used to complete the render
    return (rest: TextProps, children: React.ReactNode) => <Root {...mergeProps(props, rest)}>{children}</Root>;
  },
});

export default Text;
