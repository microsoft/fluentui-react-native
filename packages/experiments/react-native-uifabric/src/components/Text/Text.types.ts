import { ITextTokens, IForegroundColorTokens } from 'src/tokens';
import { ITextWin32Props } from '@office-iss/react-native-win32';

export const textName = 'RNFText';

/**
 * Properties for fabric native text field, these extend the default props for text
 */
export interface ITextProps extends ITextWin32Props, ITextTokens, IForegroundColorTokens {
  disabled?: boolean;
}

export interface ITextType {
  props: ITextProps;
  slotProps: {
    root: ITextWin32Props;
  };
}
