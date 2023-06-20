import type { ColorValue, FlexStyle } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import type { InteractionEvent, PressablePropsExtended, PressableState } from '@fluentui-react-native/interactive-hooks';
import type { TextProps } from '@fluentui-react-native/text';
import type { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const chipName = 'Chip';
export const ChipSizes = ['small', 'medium'] as const;
export const ChipColors = ['neutral', 'brand', 'danger', 'severe', 'success', 'warning'] as const;
export type ChipColor = (typeof ChipColors)[number];
export type ChipSize = (typeof ChipSizes)[number];

export interface ChipConfigurableProps {
  /*
   * Source URL or name of the icon to show on the Chip.
   */
  icon?: IconSourcesType;

  /**
   * The icon color.
   */
  iconColor?: ColorValue;
}

export interface ChipProps extends IViewProps, ChipConfigurableProps {
  /**
   * A Chip can be one of preset colors.
   * @defaultvalue neutral
   */
  chipColor?: ChipColor;

  /** Sets style of Chip to a preset size style
   * @defaultvalue medium
   */
  size?: ChipSize;

  /**
   * Whether the Chip is disabled or not.
   * @defaultvalue false
   */
  disabled?: boolean;

  /**
   * Selected state. Mutually exclusive to 'defaultSelected'. Use this if you control the selected state at a higher level
   * and plan to pass in the correct value based on handling onChange events and re-rendering.
   * @defaultvalue false
   */
  selected?: boolean;

  /**
   * Default selected state. Mutually exclusive to 'selected'. Use this if you want an uncontrolled component, and
   * want the Chip instance to maintain its own state.
   */
  defaultSelected?: boolean;

  /**
   * Callback that is called when the selected value has changed.
   */
  onSelectionChange?: (e: InteractionEvent, isSelected: boolean) => void;

  /**
   * Apply when chip is intended to be used in a search bar.
   * Special styling is applied to the chip.
   */
  searchBar?: boolean;

  /**
   * Show close icon when in 'selected' state.
   * @defaultvalue false
   */
  showCloseIcon?: boolean;

  /**
   * Close icon's accessibility label.
   */
  closeIconAccessibilityLabel?: string;

  /**
   * A callback to call on close icon click event.
   */
  closeIconOnPress?: (e: InteractionEvent) => void;
}
export interface ChipState extends PressableState {
  /**
   * Whether the Chip is selected or not.
   */
  selected?: boolean;
}
export interface ChipInfo {
  props: ChipProps & React.ComponentPropsWithRef<any>;
  state: ChipState;
}

export interface ChipTokens extends LayoutTokens, FontTokens, IBorderTokens, Omit<IColorTokens, 'color'>, ChipConfigurableProps {
  /**
   * Set the text color
   */
  color?: ColorValue;

  /**
   * Set the bottom edge of the Chip
   */
  bottom?: FlexStyle['bottom'];

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
   * Sizes of the Chip
   */
  small?: ChipTokens;
  medium?: ChipTokens;

  /**
   * When isRTL - applies Chip from the left side
   */
  rtl?: ChipTokens;

  /**
   * Colors of the Chip
   */
  neutral?: ChipTokens;
  brand?: ChipTokens;
  danger?: ChipTokens;
  severe?: ChipTokens;
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
  iconPressable?: PressablePropsExtended;
}

export interface ChipType {
  props: ChipProps;
  tokens: ChipTokens;
  slotProps: ChipSlotProps;
}
