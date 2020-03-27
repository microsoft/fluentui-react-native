import * as React from 'react';
import { ViewProps } from 'react-native';
import { ITextProps } from '@fluentui-react-native/text';
import { IViewWin32Props } from '@office-iss/react-native-win32';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { IForegroundColorTokens, ITextTokens } from '@fluentui-react-native/tokens';

export const radioGroupName = 'RadioGroup';

export interface IRadioGroupContext {
  /*
   ** The currently selected RadioButton's key
   */
  selectedKey: string | null;

  /*
   ** Updates the selected button and calls the client’s onChange callback
   */
  onChange?: (key: string) => void;
}

export interface IRadioGroupState {
  context: IRadioGroupContext;
}

export interface IRadioGroupProps {
  /*
   ** Descriptive label for the RadioGroup. This will be displayed as the title of the radio group to the user
   */
  label: string;

  /*
   ** The key of the RadioButton that will initially be selected
   */
  defaultSelectedKey?: string;

  /*
   **  OPTIONAL: An aria label for narrator. If not provided, it will be set to the label of the radio group
   */
  ariaLabel?: string;

  /*
   ** Callback for receiving a notification when the choice has been changed
   */
  onChange?: (key: string) => void;
}

export interface IRadioGroupTokens extends IForegroundColorTokens, ITextTokens {}

export interface IRadioGroupSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  label: ITextProps;
  container: ViewProps;
}

export type IRadioGroupRenderData = IRenderData<IRadioGroupSlotProps, IRadioGroupState>;

export interface IRadioGroupType {
  props: IRadioGroupProps;
  tokens: IRadioGroupTokens;
  slotProps: IRadioGroupSlotProps;
  state: IRadioGroupState;
}
