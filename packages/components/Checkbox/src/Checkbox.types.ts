import type * as React from 'react';
import type { ColorValue, ViewStyle, AnimatableNumericValue } from 'react-native';

import type { ITextProps, IViewProps } from '@fluentui-react-native/adapters';
import type { IFocusable, InteractionEvent, PressablePropsExtended, PressableState } from '@fluentui-react-native/interactive-hooks';
import type {
  FontTokens,
  IBorderTokens,
  IForegroundColorTokens,
  IBackgroundColorTokens,
  LayoutTokens,
} from '@fluentui-react-native/tokens';
import type { SvgProps } from 'react-native-svg';

export const checkboxName = 'Checkbox';
export type CheckboxSize = 'medium' | 'large';
export type CheckboxShape = 'circular' | 'square';

export interface CheckboxTokens extends FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens, LayoutTokens {
  /**
   * Color of the background of the box containing the checkmark.
   */
  checkboxBackgroundColor?: ColorValue;

  /**
   * Color of the border of the box containing the checkmark.
   */
  checkboxBorderColor?: ColorValue;

  /**
   * Border radius of the box containing the checkmark.
   */
  checkboxBorderRadius?: AnimatableNumericValue | string;

  /**
   * Width of the border around the box containing the checkmark.
   */
  checkboxBorderWidth?: number;

  /**
   * Height and width of the box containing the checkmark.
   */
  checkboxSize?: number;

  /**
   * Color of the checkmark icon.
   * Note: Due to upstream limitations this currently does not support PlatformColors.
   */
  checkmarkColor?: ColorValue;

  /**
   * The opacity of checkmark as a number between 0 and 1.
   */
  checkmarkOpacity?: number;

  /**
   * Height and width of the checkmark icon.
   */
  checkmarkSize?: number;

  /**
   * Color of the text that denotes that the checkbox is required
   */
  requiredColor?: ColorValue;

  /**
   * Amount of padding between the end of the label and the start of the required text
   */
  requiredPadding?: ViewStyle['padding'];

  /**
   * The amount of spacing between an icon and the content when iconPosition is set to 'before', in pixels
   */
  spacingLabelAfter?: number;

  /**
   * The amount of spacing between an icon and the content when iconPosition is set to 'after', in pixels
   */
  spacingLabelBefore?: number;

  /**
   * States that can be applied to a checkbox
   * These can be used to modify styles of the Checkbox when under the specified state.
   * Note: 'hovered','focused','circular','labelIsBefore','large' are not supported for Android
   */
  disabled?: CheckboxTokens;
  label?: CheckboxTokens;
  labelIsBefore?: CheckboxTokens;
  hovered?: CheckboxTokens;
  focused?: CheckboxTokens;
  pressed?: CheckboxTokens;
  checked?: CheckboxTokens;
  circular?: CheckboxTokens;
  medium?: CheckboxTokens;
  large?: CheckboxTokens;

  /**
   * Ripple color for Android.
   *
   * A ripple animation is shown on click for Android. This sets the color of the ripple.
   * @platform android
   */
  rippleColor?: ColorValue;
}

export interface CheckboxProps extends Omit<IViewProps, 'onPress'> {
  /**
   * Checked state. Mutually exclusive to “defaultChecked”. Use this if you control the checked state at a higher level
   * and plan to pass in the correct value based on handling onChange events and re-rendering.
   */
  checked?: boolean;

  /**
   * A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * Default checked state. Mutually exclusive to ‘checked’. Use this if you want an uncontrolled component, and
   * want the Checkbox instance to maintain its own state.
   */
  defaultChecked?: boolean;

  /**
   * Disabled state of the checkbox.
   */
  disabled?: boolean;

  /**
   * Whether to use native focus visuals for the component
   * @default true
   */
  enableFocusRing?: boolean;

  /**
   * Label to display next to the checkbox.
   */
  label?: string;

  /**
   * Allows you to set the checkbox to be at the before (start) or after (end) the label
   * Note: 'before' is not supported for Android
   * @default after
   */
  labelPosition?: 'before' | 'after';

  /**
   * Callback that is called when the checked value has changed.
   */
  onChange?: (e: InteractionEvent, isChecked: boolean) => void;

  /**
   * If true, adds an asterisk which denotes that this checkbox is required. Can also be set a custom string.
   * Also sets accessibility state to have screen reader announce required state.
   */
  required?: boolean | string;

  /**
   * The shape of the checkbox. Can be either (rounded) square or circular.
   *
   * @default square
   * @platform iOS, windows, win32
   * Note : 'circular' is not supported on Android
   */
  shape?: CheckboxShape;

  /**
   * Sets style of checkbox to a preset size style.
   * @default 'medium'
   */
  size?: CheckboxSize;

  /**
   * Provides a tooltip while hovering over Checkbox component
   * Note: Not supported for Android
   */
  tooltip?: string;
}

export interface CheckboxState extends PressableState {
  /**
   * Whether the Checkbox is checked or not
   */
  checked?: boolean;

  /**
   * Whether the Checkbox is disabled or not
   */
  disabled?: boolean;

  /**
   * Determines position of Checkbox. True if labelPosition is set to 'before'
   * Note : Not supported on Android
   */
  labelIsBefore?: boolean;
}

export interface CheckboxInfo {
  props: CheckboxProps & React.ComponentPropsWithRef<any>;
  state: CheckboxState;
}

export interface CheckboxSlotProps {
  root: React.PropsWithRef<PressablePropsExtended>;
  checkbox: PressablePropsExtended;
  checkmark: SvgProps;
  label: ITextProps;
  required: ITextProps;
}

export interface CheckboxType {
  props: CheckboxProps;
  tokens: CheckboxTokens;
  slotProps: CheckboxSlotProps;
  state: CheckboxState;
}
