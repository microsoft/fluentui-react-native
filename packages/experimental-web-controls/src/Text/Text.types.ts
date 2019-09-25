import { IComponentSettings, IStyleProp } from '@uifabricshared/foundation-settings';
import { ITextTokens, IForegroundColorTokens } from '../tokens/index';
import { ICSSStyle } from '../htmlTypes';
import { IRenderData } from '@uifabricshared/foundation-composable';

/**
 * Properties for fabric native text field, these extend the default props for text
 */
export interface ITextProps extends ITextTokens, IForegroundColorTokens {
  disabled?: boolean;
  children?: string;
  style?: IStyleProp<ICSSStyle>;
}

export interface ITextSlotProps {
  root: ITextProps;
}

export type ITextSettings = IComponentSettings<ITextSlotProps>;
export type ITextRenderData = IRenderData<ITextSlotProps>;
