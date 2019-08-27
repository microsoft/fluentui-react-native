import { IComponent, IRenderData } from '@uifabric/foundation-compose';
import { IComponentSettings } from '@uifabric/theme-settings';
import { IForegroundColorTokens, ITextTokens } from '../tokens';
import { IPressableProps, IPressableState } from '../Pressable';
import { ITextProps } from '../Text';

/**
 * Properties for fabric native Link
 */

export interface ILinkTokens extends IForegroundColorTokens, ITextTokens {
  // Link color after it has been visited
  visitedLinkColor?: string;
}

/**
 * Because style state updates are coming from the touchable and will cause a child render the link doesn't use
 * changes in state value to trigger re-render.  The values inside inner are effectively mutable and are used
 * for per-component storage.
 */
export interface ILinkState extends IPressableState {
  // whether this link is disabled
  disabled?: boolean;

  // whether this link has been visited
  visited?: boolean;
}

export interface ILinkProps extends IPressableProps {
  content?: string;
  disabled?: boolean;
  URL?: string;
}

export type ILinkCustomizableProps = ILinkProps & ILinkTokens;

export type ILinkSettings = IComponentSettings<{
  root: ILinkCustomizableProps;
  content: ITextProps;
}>;

export type ILinkComponent = IComponent<ILinkProps, ILinkSettings, ILinkCustomizableProps, ILinkState>;
export type ILinkRenderData = IRenderData<ILinkCustomizableProps, ILinkSettings, ILinkState>;
