import type { IViewProps } from '@fluentui-react-native/adapters';
import { TextProps } from '@fluentui-react-native/text';
import { IForegroundColorTokens, FontTokens } from '@fluentui-react-native/tokens';
import { FocusZoneProps } from '@fluentui-react-native/focus-zone';
import { ColorValue, ViewStyle } from 'react-native';

export const radioGroupName = 'RadioGroup';

export interface RadioGroupState extends RadioGroupProps {
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
   * Updates the group container's defaultTabbableElement
   */
  selectedButtonRef?: React.MutableRefObject<any>;

  /**
   * Array of radio keys in the group
   */
  values?: string[];
}

export interface RadioGroupTokens extends IForegroundColorTokens, FontTokens {
  /**
   * Color of required indicator
   */
  requiredColor?: ColorValue;

  /**
   * Amount of padding between the end of the label and the start of the required text
   */
  requiredPadding?: ViewStyle['padding'];

  /**
   * The flex direction of the Radios
   */
  flexDirection?: ViewStyle['flexDirection'];

  /**
   * States that can be applied to a RadioGroup
   */
  disabled?: RadioGroupTokens;
  isHorizontal?: RadioGroupTokens;
}

export interface RadioGroupProps extends Pick<FocusZoneProps, 'isCircularNavigation' | 'defaultTabbableElement'>, IViewProps {
  /**
   * Descriptive label for the RadioGroup. This will be displayed as the title of the radio group to the user.
   */
  label?: string;

  /**
   * The key of the RadioButton that will initially be selected.
   *
   * This is mutually-exclusive if radiogroup is disabled or radio button is disabled.
   */
  defaultValue?: string;

  /**
   * The key of the selected option. If you provide this, you must maintain selection state by observing
   * onChange events and passing a new value in when changed. This overrides defaultSelectedKey
   * and makes the RadioGroup a controlled component.
   */
  value?: string;

  /**
   * Require a selection in this group. Adds the 'required' prop to all child Radio items.
   */
  required?: boolean;

  /**
   * Sets the RadioGroup to disabled if true
   */
  disabled?: boolean;

  /**
   * The position of the label relative to the indicator.
   *
   * @default vertical
   */
  layout?: 'vertical' | 'horizontal' | 'horizontal-stacked';

  /**
   * Callback for receiving a notification when the choice has been changed
   */
  onChange?: (key: string) => void;
}

export interface RadioGroupInfo {
  props: RadioGroupProps;
  state: RadioGroupState;
}

export interface RadioGroupSlotProps {
  root: React.PropsWithRef<IViewProps>;
  label?: IViewProps;
  labelText?: TextProps;
  required?: TextProps;
  options: IViewProps;
  container: FocusZoneProps;
}

export interface RadioGroupType {
  props: RadioGroupProps;
  tokens: RadioGroupTokens;
  slotProps: RadioGroupSlotProps;
  state: RadioGroupState;
}
