import { FontTokens, FontVariantTokens, IForegroundColorTokens, IColorTokens } from '@fluentui-react-native/tokens';
import { ITextProps as INativeTextProps } from '@fluentui-react-native/adapters';

export const textName = 'RNFText';

/**
 * Properties for fabric native text field, these extend the default props for text
 */
export type ITextProps<TBase = INativeTextProps> = TBase &
  FontVariantTokens &
  IForegroundColorTokens & {
    disabled?: boolean;
  };

export type ITextType<TBase = INativeTextProps> = {
  props: ITextProps<TBase>;
  tokens: FontTokens & IColorTokens;
  slotProps: {
    root: TBase;
  };
};
