import { ITextTokens, IForegroundColorTokens } from '@fluentui-react-native/tokens';
import { ITextProps as INativeTextProps } from '@fluentui-react-native/adapters';

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
  slotProps: {
    root: TBase;
  };
};
