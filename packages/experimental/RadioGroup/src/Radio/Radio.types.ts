import type { IViewProps } from '@fluentui-react-native/adapters';
import { TextProps } from '@fluentui-react-native/text';
import { FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens, IColorTokens } from '@fluentui-react-native/tokens';
import { IFocusable, PressablePropsExtended, PressableState } from '@fluentui-react-native/interactive-hooks';
import { ColorValue, ViewStyle } from 'react-native';
import { Variant } from '@fluentui-react-native/framework';

export const radioName = 'Radio';

export interface RadioTokens extends FontTokens, IColorTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {
  /**
   * Indicator border color
   */
  radioBorder?: ColorValue;

  /**
   * Indicator border color
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
  radioSize?: number;

  /**
   * Diameter size of the inner circle indicator
   */
  radioInnerCircleSize?: number;

  /**
   * Border width of Radio
   */
  radioBorderWidth?: number;

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
   * Label's top margin.
   */
  labelMarginTop?: ViewStyle['marginTop'];

  /**
   * Padding between label content and focus ring.
   */
  labelMarginRight?: ViewStyle['marginRight'];

  /**
   * Padding between label content and focus ring.
   */
  labelMarginLeft?: ViewStyle['marginLeft'];

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
  root: IViewProps;
  button: IViewProps;
  innerCircle: IViewProps;
  labelContent: IViewProps;
  label: TextProps;
  subtext?: TextProps;
}

export interface RadioType {
  props: RadioProps;
  tokens: RadioTokens;
  slotProps: RadioSlotProps;
}
