import type { IViewProps } from '@fluentui-react-native/adapters';
import { TextProps } from '@fluentui-react-native/text';
import { IForegroundColorTokens, FontTokens } from '@fluentui-react-native/tokens';
import { FocusZoneProps } from '@fluentui-react-native/focus-zone';
import { RadioGroupContextValue } from './radioGroupContext';

export const radioGroupName = 'RadioGroup';

export interface RadioGroupState {
  context: RadioGroupContextValue;
}

export interface RadioGroupTokens extends IForegroundColorTokens, FontTokens {}

export interface RadioGroupProps {
  /**
   * Descriptive label for the RadioGroup. This will be displayed as the title of the radio group to the user.
   */
  label?: string;

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

export interface RadioGroupSlotProps {
  root: React.PropsWithRef<IViewProps>;
  label?: TextProps;
  container: FocusZoneProps;
}

export interface RadioGroupType {
  props: RadioGroupProps;
  tokens: RadioGroupTokens;
  slotProps: RadioGroupSlotProps;
  state: RadioGroupState;
}
