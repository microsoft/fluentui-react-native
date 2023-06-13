import type { ColorValue, FlexStyle } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { ShadowProps } from '@fluentui-react-native/experimental-shadow';
import type { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import type { InteractionEvent, PressablePropsExtended, PressableState } from '@fluentui-react-native/interactive-hooks';
import type { TextProps } from '@fluentui-react-native/text';
import type { ShadowToken } from '@fluentui-react-native/theme-types';
import type { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const chipName = 'Chip';
export const ChipSizes = ['tiny', 'extraSmall', 'small', 'medium', 'large', 'extraLarge'] as const;
export const ChipAppearances = ['filled', 'outline', 'tint', 'ghost'] as const;
export const ChipShapes = ['rounded', 'circular', 'square'] as const;
export const ChipColors = ['brand', 'danger', 'important', 'informative', 'severe', 'subtle', 'success', 'warning'] as const;
export type ChipNamedColor = (typeof ChipColors)[number];
export type ChipSize = (typeof ChipSizes)[number];
export type ChipAppearance = (typeof ChipAppearances)[number];
export type ChipShape = (typeof ChipShapes)[number];
export type ChipColor = ChipNamedColor | ColorValue;
export type ChipIconPosition = 'before' | 'after';

export interface ChipConfigurableProps {
  /**
   * A Chip can be one of preset colors.
   * 'important', 'informative', 'subtle' are not supported on Android.
   * @defaultvalue brand,
   * @defaultvalue neutral on @platform android.
   */
  chipColor?: ChipColor;

  /**
   * Set the text color
   */
  color?: ColorValue;

  /*
   * Source URL or name of the icon to show on the Chip.
   */
  icon?: IconSourcesType;

  /**
   * The icon color.
   */
  iconColor?: ColorValue;

  /**
   * Icon can be placed before or after Chip's content.
   * @default before
   */
  iconPosition?: ChipIconPosition;

  /**
   * Chip position
   * @defaultvalue absolute
   */
  position?: FlexStyle['position'];
}

export interface ChipCoreProps extends IViewProps {
  /**
   * A Chip can be square, circular or rounded.
   * @defaultvalue circular
   */
  shape?: ChipShape;

  /** Sets style of Chip to a preset size style
   * 'tiny', 'extraSmall', 'large', 'extraLarge' are not supported on Android.
   * @defaultvalue medium
   */
  size?: ChipSize;
}

export interface ChipProps extends ChipCoreProps, ChipConfigurableProps {
  /**
   * A Chip can have its content and borders styled for greater emphasis or to be subtle.
   * It can be filled, outline, ghost, inverted
   * @defaultvalue filled
   */
  appearance?: ChipAppearance;

  /**
   * Whether the Chip is disabled or not.
   * @platform android
   */
  disabled?: boolean;

  /**
   * Selected state. Mutually exclusive to 'defaultSelected'. Use this if you control the selected state at a higher level
   * and plan to pass in the correct value based on handling onChange events and re-rendering.
   * @platform android
   */
  selected?: boolean;

  /**
   * Default selected state. Mutually exclusive to 'selected'. Use this if you want an uncontrolled component, and
   * want the Chip instance to maintain its own state.
   * @platform android
   */
  defaultSelected?: boolean;

  /**
   * Callback that is called when the selected value has changed.
   * @platform android
   */
  onSelectionChange?: (e: InteractionEvent, isSelected: boolean) => void;

  /**
   * Apply when chip is intended to be used in a search bar.
   * Special styling is applied to the chip.
   * @platform android
   */
  searchBar?: boolean;

  /**
   * Show close icon when in 'selected' state.
   * @platform android
   */
  showCloseIcon?: boolean;
}
export interface ChipState extends PressableState {
  /**
   * Whether the Chip is selected or not.
   * @platform android
   */
  selected?: boolean;
}
export interface ChipInfo {
  props: ChipProps & React.ComponentPropsWithRef<any>;
  state: ChipState;
}

export interface ChipCoreTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, Omit<IColorTokens, 'color'> {
  /**
   * Set the bottom edge of the Chip
   */
  bottom?: FlexStyle['bottom'];

  /**
   * The height of the Chip.
   */
  height?: number;

  /**
   * The icon size.
   */
  iconSize?: number;

  /**
   * Set the left edge of the Chip
   */
  left?: FlexStyle['left'];

  /**
   * Set the right edge of the Chip
   */
  right?: FlexStyle['right'];

  /**
   * Set padding for text container when Chip contains
   * icons or images
   */
  textMargin?: number;

  /**
   * Set the top edge of the Chip
   */
  top?: FlexStyle['top'];

  /**
   * Sets shadow style with `ambient` and `key` props
   */
  shadowToken?: ShadowToken;

  /**
   * The width of the Chip.
   */
  width?: number;

  /**
   * Sizes of the Chip
   */
  tiny?: ChipTokens;
  extraSmall?: ChipTokens;
  small?: ChipTokens;
  medium?: ChipTokens;
  large?: ChipTokens;
  extraLarge?: ChipTokens;

  /**
   * Shapes of the Chip
   */
  rounded?: ChipTokens;
  circular?: ChipTokens;
  square?: ChipTokens;
}
export interface ChipTokens extends ChipCoreTokens, ChipConfigurableProps {
  /*
   * The weight of the lines used when drawing the icon.
   */
  iconWeight?: number;

  /**
   * When isRTL - applies Chip from the left side
   */
  rtl?: ChipTokens;

  /**
   * Additional states that can be applied to a Chip
   */
  filled?: ChipTokens;
  outline?: ChipTokens;
  tint?: ChipTokens;
  ghost?: ChipTokens;

  /**
   * Colors of the Chip
   */
  brand?: ChipTokens;
  danger?: ChipTokens;
  important?: ChipTokens;
  informative?: ChipTokens;
  severe?: ChipTokens;
  subtle?: ChipTokens;
  success?: ChipTokens;
  warning?: ChipTokens;
  disabled?: ChipTokens;
  searchBar?: ChipTokens;
  /**
   * Selected state tokens for Chip
   */
  selected?: ChipTokens;
}

export interface ChipSlotProps {
  root: PressablePropsExtended;
  icon?: IconProps;
  text: TextProps;
  shadow?: ShadowProps;
}

export interface ChipType {
  props: ChipProps;
  tokens: ChipTokens;
  slotProps: ChipSlotProps;
}
