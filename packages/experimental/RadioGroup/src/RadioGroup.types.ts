import * as React from 'react';
import { ITextProps } from '@fluentui-react-native/text';
import type { IViewWin32Props } from '@office-iss/react-native-win32';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { IForegroundColorTokens, FontTokens } from '@fluentui-react-native/tokens';
import { FocusZoneProps } from '@fluentui-react-native/focus-zone';

export const radioGroupName = 'RadioGroup';

export interface RadioGroupContextType {
  /**
   * The currently selected RadioButton's key
   */
  value: string | null;

  /**
   * Updates the selected button and calls the client’s onChange callback
   */
  onChange?: (key: string) => void;

  /**
   * Updates the selected button's ref to set as the default tabbable element
   */
  updateSelectedButtonRef?: (ref: React.RefObject<any>) => void;

  /**
   * Array of radio button keys in the group
   */
  buttonKeys?: string[];
}

export interface RadioGroupState {
  context: RadioGroupContextType;
}

export interface RadioGroupProps {
  /**
   * Descriptive label for the RadioGroup. This will be displayed as the title of the radio group to the user.
   */
  label: string;

  /**
   * The key of the RadioButton that will initially be selected
   */
  defaultValue?: string;

  /*
   ** An accessibility label for screen readers. If not provided, it will be set to the label of the radio group.
   */
  accessibilityLabel?: string;

  /**
   * The key of the selected option. If you provide this, you must maintain selection state by observing
   * onChange events and passing a new value in when changed. This overrides defaultSelectedKey
   * and makes the RadioGroup a controlled component.
   */
  value?: string;

  /**
   * Callback for receiving a notification when the choice has been changed
   */
  onChange?: (key: string) => void;

  testID?: string;
}

export interface RadioGroupTokens extends IForegroundColorTokens, FontTokens {}

export interface RadioGroupSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  label?: ITextProps;
  container: FocusZoneProps;
}

export type RadioGroupRenderData = IRenderData<RadioGroupSlotProps, RadioGroupState>;

export interface RadioGroupType {
  props: RadioGroupProps;
  tokens: RadioGroupTokens;
  slotProps: RadioGroupSlotProps;
  state: RadioGroupState;
}
