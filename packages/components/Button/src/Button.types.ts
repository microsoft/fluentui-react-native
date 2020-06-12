import * as React from 'react';
import { ViewProps, ImageProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { ITextProps } from '@fluentui-react-native/text';
import { IPressableProps } from '@fluentui-react-native/pressable';
import { ITextTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import { IFocusable, IPressableState } from '@fluentui-react-native/interactive-hooks';
import { IViewWin32Props } from '@office-iss/react-native-win32';

export const buttonName = 'Button';

export interface IButtonInfo extends IPressableState {
  /*
   * Disables the button.
   * @default false
   * @deprecated
   */
  disabled?: boolean;

  /*
   * Button icon.
   */
  icon?: boolean;

  /*
   * Button text.
   */
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
   * The amount of padding between the border and the contents.
   */
  contentPadding?: number | string;

  /**
   * The amount of padding between the border and the contents when the Button has focus.
   */
  contentPaddingFocused?: number | string;

  /**
   * The icon color.
   */
  iconColor?: string;

  /**
   * The icon color when hovering over the Button.
   */
  iconColorHovered?: string;

  /**
   * The icon color when the Button is being pressed.
   */
  iconColorPressed?: string;

  /**
   * The size of the icon.
   */
  iconSize?: number | string;

  /**
   * The weight of the lines used when drawing the icon.
   */
  iconWeight?: number;

  /**
   * Text to show on the Button.
   */
  content?: string;

  /**
   * Source URL or name of the icon to show on the Button.
   */
  icon?: string;
}

export interface IButtonProps extends Omit<IPressableProps, 'onPress'> {
  /*
   * Text to show on the Button.
   */
  content?: string;

  /*
   * Source URL or name of the icon to show on the Button.
   */
  icon?: string;
  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;
  /**
   * A callback to call on button click event
   */
  onClick?: () => void;

  testID?: string;
  tooltip?: string;
}

export interface IButtonSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  stack: ViewProps;
  icon: ImageProps;
  content: ITextProps;
}

export type IButtonRenderData = IRenderData<IButtonSlotProps, IButtonState>;

export interface IButtonType {
  props: IButtonProps;
  tokens: IButtonTokens;
  slotProps: IButtonSlotProps;
  state: IButtonState;
}
