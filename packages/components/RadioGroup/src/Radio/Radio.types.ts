import type { ColorValue, ViewStyle } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { Variant } from '@fluentui-react-native/framework';
import type { IFocusable, PressablePropsExtended, PressableState } from '@fluentui-react-native/interactive-hooks';
import type { TextProps } from '@fluentui-react-native/text';
import type {
  FontTokens,
  IForegroundColorTokens,
  IBackgroundColorTokens,
  IBorderTokens,
  IColorTokens,
} from '@fluentui-react-native/tokens';
import type { SvgProps } from 'react-native-svg';

export const radioName = 'Radio';

export interface RadioTokens extends FontTokens, IColorTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {
  /**
   * Horizontal padding of the root view
   */
  rootHorizontalPadding?: number;

  /**
   * Vertical padding of the root view
   */
  rootVerticalPadding?: number;

  /**
   * Indicator border color
   */
  radioBorder?: ColorValue;

  /**
   * Indicator border style
   */
  radioBorderStyle?: ViewStyle['borderStyle'];

  /**
   * Inner circle color when selected
   */
  radioFill?: ColorValue;

  /**
   * Visibility of the radio inner circle from 0 to 1
   */
  radioVisibility?: number;

  /**
   * Diameter size of the outer indicator
   */
  radioOuterCircleSize?: number;

  /**
   * Diameter size of the inner circle indicator
   */
  radioInnerCircleSize?: number;

  /**
   * Border width of Radio
   */
  radioBorderWidth?: number;

  /**
   * Background color of outer circle
   */
  radioOuterCircleBackground?: ColorValue;

  /**
   * The flex direction of the root
   */
  flexDirection?: ViewStyle['flexDirection'];

  /**
   * Root item alignment
   */
  alignItems?: ViewStyle['alignItems'];

  /**
   * The top margin
   */
  marginTop?: ViewStyle['marginTop'];

  /**
   * The right margin
   */
  marginRight?: ViewStyle['marginRight'];

  /**
   * The bottom margin
   */
  marginBottom?: ViewStyle['marginBottom'];

  /**
   * The left margin
   */
  marginLeft?: ViewStyle['marginLeft'];

  /**
   * Label item alignment
   */
  labelAlignItems?: ViewStyle['alignItems'];

  /**
   * Label's top margin.
   */
  labelMarginVertical?: ViewStyle['marginVertical'];

  /**
   * Label's right margin.
   */
  labelMarginRight?: ViewStyle['marginRight'];

  /**
   * Label's left margin.
   */
  labelMarginLeft?: ViewStyle['marginLeft'];

  /**
   * Label's padding.
   */
  labelPadding?: ViewStyle['marginLeft'];

  /*
   * Variant of label subtext.
   *
   * Should only by used if subtext prop is provided.
   */
  subtextVariant?: keyof Variant;

  /**
   * Padding between label and label subtext.
   *
   * Should only by used if subtext prop is provided.
   */
  subtextMarginTop?: ViewStyle['marginTop'];

  /**
   * Padding between label subtext and focus ring.
   *
   * Should only by used if subtext prop is provided.
   */
  subtextMarginBottom?: ViewStyle['marginBottom'];

  /**
   * Ripple color for Android.
   *
   * A ripple animation is shown on click for Android. This sets the color of the ripple.
   * @platform android
   */
  rippleColor?: ColorValue;

  /**
   * Ripple radius for circular radio on Android.
   *
   * A ripple animation is shown on click for Android. This sets the radius of the circular ripple shown on the radio button.
   * @platform android
   */
  rippleRadius?: number;

  /**
   * States that can be applied to a Radio
   */
  labelPositionBelow?: RadioTokens;
  selected?: RadioTokens;
  disabled?: RadioTokens;
  hovered?: RadioTokens;
  focused?: RadioTokens;
  pressed?: RadioTokens;
}

export interface RadioProps extends PressablePropsExtended {
  /**
   * The text string for the option
   */
  label: string;

  /**
   * Label subtext for the option
   */
  subtext?: string;

  /**
   * A unique key-identifier for each option
   */
  value: string;

  /**
   * Whether or not the radio button is selectable
   */
  disabled?: boolean;

  /**
   * The position of the label relative to the radio indicator.
   *
   * This defaults to 'after' unless the Radio is inside a RadioGroup with layout horizontal-stacked,
   * in which case it defaults to 'below'
   *
   * 'below' is not supported from Fluent Android and Win32, renders as-is.
   * @default after
   */
  labelPosition?: 'after' | 'below';

  /**
   * A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * Whether to use native focus visuals for the component
   * @default true
   */
  enableFocusRing?: boolean;
}

export interface RadioInfo {
  props: RadioProps & React.ComponentPropsWithRef<any>;
  state: PressableState;
}

export interface RadioSlotProps {
  root: React.PropsWithRef<PressablePropsExtended>;
  button: PressablePropsExtended;
  innerCircle?: IViewProps;
  checkmark?: SvgProps;
  labelContent: IViewProps;
  label: TextProps;
  subtext?: TextProps;
}

export interface RadioType {
  props: RadioProps;
  tokens: RadioTokens;
  slotProps: RadioSlotProps;
}
