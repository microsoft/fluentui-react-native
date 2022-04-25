import {
  FontTokens,
  FontVariantTokens,
  buildUseTokens
} from '@fluentui-react-native/framework';
import { ITextProps } from '@fluentui-react-native/adapters';
import { ColorValue } from 'react-native';

export const textName = 'Text';

/**
 * Text tokens, these are the internally configurable values for Text elements. In particular these
 * drive decisions on how to build the styles
 */
 export interface TextTokens extends FontTokens {
  /** foreground text color */
  color?: ColorValue;
}

export type TextAlign = 'start' | 'center' | 'end' | 'justify';
export type TextFont = 'base' | 'monospace' | 'numeric';
export type TextSize = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000;
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/**
 * Text props, based off of the standard react-native TextProps with some new extensions
 */
export type TextProps<TBase = ITextProps> = TBase &
  FontVariantTokens & {
    /** foreground text color */
    color?: ColorValue;

    /** alternate mode for disabled look and feel */
    disabled?: boolean;
    /**
    * Aligns text based on the parent container.
    *
    * @defaultValue start
    */
    align?: TextAlign;

    /**
    * Applies a block display for the content.
    *
    * @defaultValue false
    */
    block?: boolean;

    /**
    * Applies the font family to the content.
    *
    * @defaultValue base
    */
    font?: TextFont;

    /**
    * Applies the italic font style to the content.
    *
    * @defaultValue false
    */
    italic?: boolean;

    /**
    * Applies the strikethrough text decoration to the content.
    *
    * @defaultValue false
    */
    strikethrough?: boolean;

    /**
    * Applies font size and line height based on the theme tokens.
    *
    * @defaultValue 300
    */
    size?: TextSize;

    /**
    * Truncate overflowing text for block displays.
    *
    * @defaultValue false
    */
    truncate?: boolean;

    /**
    * Applies the underline text decoration to the content.
    *
    * @defaultValue false
    */
    underline?: boolean;

     /**
    * Applies font weight to the content.
    *
    * @defaultValue regular
    */
    weight?: TextWeight;

    /**
    * Wraps the text content on white spaces.
    *
    * @defaultValue true
    */
    wrap?: boolean;
  };

export const useTextTokens = buildUseTokens<TextTokens>(
  (t) => ({
    variant: 'body2',
    color: t.colors.bodyText,
  }),
  textName,
);
