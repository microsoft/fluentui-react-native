import * as React from 'react';
import { ViewProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { ITextProps } from '../Text';
import { IViewWin32Props } from '@office-iss/react-native-win32';
import { ITextTokens } from '../../tokens/TextTokens';
import { IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens } from 'src/tokens';
import { IPressableProps } from '../Pressable';

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
}

export interface IRadioButtonTokens extends ITextTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {}

export interface IRadioButtonSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  button: ViewProps;
  innerCircle: ViewProps;
  content: ITextProps;
}

export type IRadioButtonRenderData = IRenderData<IRadioButtonSlotProps>;

export interface IRadioButtonType {
  props: IRadioButtonProps;
  //tokens:
  slotProps: IRadioButtonSlotProps;
}
