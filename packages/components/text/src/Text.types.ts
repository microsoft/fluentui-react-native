import { ITextTokens, IForegroundColorTokens, IColorTokens } from '@fluentui-native/tokens';
import { ITextProps as INativeTextProps } from '@fluentui-native/adapters';

export const textName = 'RNFText';

/**
 * Properties for fabric native text field, these extend the default props for text
 */
export type ITextProps<TBase = INativeTextProps> = TBase &
  ITextTokens &
  IForegroundColorTokens & {
    disabled?: boolean;
  };

export type ITextType<TBase = INativeTextProps> = {
  props: ITextProps<TBase>;
  tokens: ITextTokens & IColorTokens;
  slotProps: {
    root: TBase;
  };
};
