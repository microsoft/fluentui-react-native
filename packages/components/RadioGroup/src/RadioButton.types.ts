import * as React from 'react';
import { ViewProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { ITextProps } from '@fluentui-react-native/text';
import { IFocusable } from '@fluentui-react-native/interactive-hooks';
import { IViewWin32Props } from '@office-iss/react-native-win32';
import { FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import { IPressableProps } from '@fluentui-react-native/pressable';

export const radioButtonName = 'RadioButton';

// Props for the radio button
export interface IRadioButtonProps extends IPressableProps {
  /*
   ** The text string for the option
   */
  content: string;

  /*
   ** A unique key-identifier for each option
   */
  buttonKey: string;

  /*
   ** Whether or not the radio button is selectable
   */
  disabled?: boolean;

  /*
   ** An optional string for the Narrator to read for each RadioButton. If not provided, this will be set to the button's content
   */
  ariaLabel?: string;

  /**
   * A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;
}

export interface IRadioButtonTokens extends FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {
  textBorderColor?: string;
}

export interface IRadioButtonSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  button: ViewProps;
  innerCircle: ViewProps;
  content: ITextProps;
}

export type IRadioButtonRenderData = IRenderData<IRadioButtonSlotProps>;

export interface IRadioButtonType {
  props: IRadioButtonProps;
  tokens: IRadioButtonTokens;
  slotProps: IRadioButtonSlotProps;
}
