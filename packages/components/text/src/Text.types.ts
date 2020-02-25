import { ITextTokens, IForegroundColorTokens } from '@fluentui-native/tokens';
import { ITextProps as INativeTextProps } from '@fluentui-native/adapters';

export const textName = 'RNFText';

/**
 * Properties for fabric native text field, these extend the default props for text
 */
export interface ITextProps extends INativeTextProps, ITextTokens, IForegroundColorTokens {
  disabled?: boolean;
}

export interface ITextType {
  props: ITextProps;
  slotProps: {
    root: INativeTextProps;
  };
}
