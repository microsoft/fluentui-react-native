import * as React from 'react';
import { ViewProps } from 'react-native';
import { ITextProps } from '../Text';
import { IViewWin32Props } from '@office-iss/react-native-win32';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { ITextTokens } from '../../tokens/TextTokens';

export const radioGroupName = 'RadioGroup';

export interface IRadioGroupState {
  /*
   ** The currently selected RadioButton's key
   */
  selectedKey: string;

  /*
   ** Updates the selected button and calls the client’s onChange callback
   */
  onChange: (key: string) => void;
}

export interface IRadioGroupProps {
  /*
   ** Descriptive label for the RadioGroup. This will be displayed as the title of the radio group to the user
   */
  label: string;

  /*
   ** The key of the RadioButton that will initially be selected
   */
  defaultSelectedKey: string;

  /*
   **  OPTIONAL: An aria label for narrator. If not provided, it will be set to the label of the radio group
   */
  ariaLabel?: string;

  /*
   ** Callback for receiving a notification when the choice has been changed
   */
  onChange: (key: string) => void;
}

export interface IRadioGroupTokens extends ITextTokens {}

export interface IRadioGroupSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  label: ITextProps;
  radioButtonContainer: ViewProps;
}

export type IRadioGroupRenderData = IRenderData<IRadioGroupSlotProps, IRadioGroupState>;

export interface IRadioGroupType {
  props: IRadioGroupProps;
  //tokens:
  slotProps: IRadioGroupSlotProps;
  state: IRadioGroupState;
}
