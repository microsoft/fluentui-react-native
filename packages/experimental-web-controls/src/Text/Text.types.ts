import { IComponent, IRenderData } from '@uifabric/foundation-compose';
import { IComponentSettings, IStyleProp } from '@uifabric/theme-settings';
import { ITextTokens, IForegroundColorTokens } from '../tokens/index';
import { ICSSStyle } from '../htmlTypes';

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
export type ITextComponent = IComponent<ITextProps, ITextSettings>;
export type ITextRenderData = IRenderData<ITextProps, ITextSettings>;
