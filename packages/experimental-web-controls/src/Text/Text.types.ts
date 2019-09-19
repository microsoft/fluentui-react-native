import { IComponent } from '@uifabric/foundation-compose';
import { IComponentSettings, IStyleProp } from '@uifabric/foundation-settings';
import { ITextTokens, IForegroundColorTokens } from '../tokens/index';
import { ICSSStyle } from '../htmlTypes';
import { IRenderData } from '@uifabric/foundation-composable';

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
export type ITextComponent = IComponent<ITextProps>;
export type ITextRenderData = IRenderData<ITextSlotProps>;
