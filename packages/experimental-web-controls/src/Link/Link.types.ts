import { IComponentSettings } from '@uifabricshared/foundation-settings';
import { IForegroundColorTokens, ITextTokens } from '../tokens';
import { IPressableProps, IPressableState } from '../Pressable';
import { ITextProps } from '../Text';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { IButtonProps } from '../Button';

/**
 * Properties for fabric native Link
 */

export type ILinkTokens = IForegroundColorTokens & ITextTokens;

/**
 * Because style state updates are coming from the touchable and will cause a child render the link doesn't use
 * changes in state value to trigger re-render.  The values inside inner are effectively mutable and are used
 * for per-component storage.
 */
export type ILinkState = IPressableState & {
  // whether this link uses a URL [will override onClick if provided]
  URL?: boolean;
  // whether this link has been visited
  visited?: boolean;
};

export type ILinkProps = IPressableProps & {
  content?: string;
  disabled?: boolean;
  URL?: string;
};

export type ILinkCustomizableProps = ILinkProps & ILinkTokens;

export type ILinkSlotProps = {
  root: React.HTMLAttributes<HTMLAnchorElement>;
  buttonAsRoot: IButtonProps & ILinkTokens;
  content: ITextProps;
};

export type ILinkSettings = IComponentSettings<ILinkSlotProps>;
export type ILinkRenderData = IRenderData<ILinkSlotProps, ILinkState>;

export interface ILinkType {
  props: ILinkProps;
  slotProps: ILinkSlotProps;
  state: ILinkState;
  tokens: IForegroundColorTokens & ITextTokens;
}
