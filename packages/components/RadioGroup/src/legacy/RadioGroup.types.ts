import type * as React from 'react';

import type { FocusZoneProps } from '@fluentui-react-native/focus-zone';
import type { ITextProps } from '@fluentui-react-native/text';
import type { IForegroundColorTokens, FontTokens } from '@fluentui-react-native/tokens';
import type { IViewWin32Props } from '@office-iss/react-native-win32';
import type { IRenderData } from '@uifabricshared/foundation-composable';

export const radioGroupName = 'RadioGroup';

export interface IRadioGroupContext {
  /**
   * The currently selected RadioButton's key
   */
  selectedKey: string | null;

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

  /**
   * Populate the buttonKeys array (all RadioButton keys) at mount and un-mount
   */
  addRadioButtonKey?: (value: string) => void;
  removeRadioButtonKey?: (value: string) => void;

  /**
   * Array of enabled Radio keys in the RadioGroup
   * @platform win32
   */
  enabledButtonKeys?: string[];

  /**
   * Populate the enabledButtonKeys array (only enabled/valid RadioButton keys) at mount and un-mount
   * @platform win32
   */
  addRadioButtonEnabledKey?: (value: string) => void;
  removeRadioButtonEnabledKey?: (value: string) => void;

  /**
   * Updates invoked to signal that arrow key has been pressed and focus needs to be set
   * @platform win32
   */
  updateInvoked?: (check: boolean) => void;

  /**
   * Signals whether arrow key has been pressed
   * @platform win32
   */
  invoked?: boolean;
}

export interface IRadioGroupState {
  context: IRadioGroupContext;
}

export type IRadioGroupProps = React.PropsWithChildren<{
  /**
   * Descriptive label for the RadioGroup. This will be displayed as the title of the radio group to the user.
   */
  label: string;

  /**
   * The key of the RadioButton that will initially be selected
   */
  defaultSelectedKey?: string;

  /**
   *  A label for screen readers. If not provided, it will be set to the label of the radio group.
   * @deprecated Use accessibilityLabel instead.
   */
  ariaLabel?: string;

  /*
   ** An accessibility label for screen readers. If not provided, it will be set to the label of the radio group.
   */
  accessibilityLabel?: string;

  /**
   * The key of the selected option. If you provide this, you must maintain selection state by observing
   * onChange events and passing a new value in when changed. This overrides defaultSelectedKey
   * and makes the RadioGroup a controlled component.
   */
  selectedKey?: string;

  /**
   * Callback for receiving a notification when the choice has been changed
   */
  onChange?: (key: string) => void;

  testID?: string;
}>;

export interface IRadioGroupTokens extends IForegroundColorTokens, FontTokens {}

export interface IRadioGroupSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  label: ITextProps;
  container: FocusZoneProps;
}

export type IRadioGroupRenderData = IRenderData<IRadioGroupSlotProps, IRadioGroupState>;

export interface IRadioGroupType {
  props: IRadioGroupProps;
  tokens: IRadioGroupTokens;
  slotProps: IRadioGroupSlotProps;
  state: IRadioGroupState;
}
