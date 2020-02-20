import { IStyleProp } from '@uifabricshared/foundation-settings';
import { ITextTokens, IForegroundColorTokens } from '../tokens/index';
import { ICSSStyle, IDivProps } from '../htmlTypes';

/**
 * Properties for fabric native text field, these extend the default props for text
 */
export interface ITextProps extends ITextTokens, IForegroundColorTokens {
  disabled?: boolean;
  children?: string;
  style?: IStyleProp<ICSSStyle>;
}

export interface ITextType {
  tokens: ITextTokens & IForegroundColorTokens;
  props: ITextProps;
  slotProps: {
    root: IDivProps;
  };
}
