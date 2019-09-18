import { IComponent, IRenderData } from '@uifabricshared/foundation-compose';
import { ITextProps } from '../Text/index';
import { IPressableState, IPressableProps } from '../Pressable/index';
import { IComponentSettings } from '@uifabricshared/foundation-settings';
import { IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens, ITextTokens } from '../tokens/index';
import { IImageProps } from '../htmlTypes';
import { IStackProps } from '../Stack/index';

export interface IButtonInfo extends IPressableState {
  // whether this button is disabled
  disabled?: boolean;

  // whether icon or text is specified
  icon?: boolean;
  content?: boolean;
}

/**
 * Because state updates are coming from the touchable and will cause a child render the button doesn't use
 * changes in state value to trigger re-render.  The values inside inner are effectively mutable and are used
 * for per-component storage
 */
export interface IButtonState {
  info: IButtonInfo;
}

export interface IButtonTokens extends ITextTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {
  /**
   * Defines the padding of the Button, between the Button border and the Button contents.
   */
  contentPadding?: number | string;

  /**
   * Defines the padding of the Button, between the Button border and the Button contents, when the focus is on the Button.
   */
  contentPaddingFocused?: number | string;

  /**
   * Defines the icon color of the Button.
   */
  iconColor?: string;

  /**
   * Defines the icon color of the Button when it is in a hovered state.
   */
  iconColorHovered?: string;

  /**
   * Defines the icon color of the Button when it is in an active state.
   */
  iconColorPressed?: string;

  /**
   * Defines the size of the icon inside the Button.
   */
  iconSize?: number | string;

  /**
   * Defines the font weight of the icon inside the Button.
   */
  iconWeight?: number;

  /**
   * If this button has text this should be set
   */
  content?: string;

  /**
   * If this button has an icon this is the source url or icon name
   */
  icon?: string;
}

export interface IButtonProps extends IPressableProps {
  disabled?: boolean;
  content?: string;
  icon?: string;
}

export type IButtonCustomizableProps = IButtonProps & IButtonTokens & IStackProps;

export type IButtonSettings = IComponentSettings<{
  root: IButtonCustomizableProps;
  icon: IImageProps;
  content: ITextProps;
}>;

export type IButtonComponent = IComponent<IButtonProps, IButtonSettings, IButtonCustomizableProps, IButtonState>;
export type IButtonRenderData = IRenderData<IButtonCustomizableProps, IButtonSettings, IButtonState>;
