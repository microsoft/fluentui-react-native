import { ViewProps, ColorValue } from 'react-native';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import { LayoutTokens } from '@fluentui-react-native/tokens';
import { TextProps } from '@fluentui-react-native/text';

export const divider = 'Divider';

export const DividerInsetSizes = [0, 16, 56, 68, 72, 108] as const;
export type DividerInsetSize = typeof DividerInsetSizes[number];

export type DividerAlignment = 'start' | 'center' | 'end';
export type DividerAppearance = 'default' | 'subtle' | 'brand' | 'strong';

export interface DividerCoreProps {
  /**
   * Colors both the divider lines and the content itself, overriding the colors provided by the appearance prop.
   */
  color?: ColorValue;
  /**
   * The size of the Divider inset - the margin before the start and after the end of the divider.
   */
  insetSize?: DividerInsetSize;
  /**
   * Whether the divider is rendered as a horizontal line or a vertical line.
   */
  vertical?: boolean;
}

export interface DividerProps extends DividerCoreProps {
  /**
   * If a text or icon is passed, this dictates where content appears in the divider: at the start, centered, or towards the end.
   */
  alignContent?: DividerAlignment;
  /**
   * If no color is passed, the divider and its content are colored using different theme tokens depending on the value of this prop.
   */
  appearance?: DividerAppearance;
  /**
   * Pass an icon source to render an icon as content in the divider. Mutually exclusive with text.
   */
  icon?: IconSourcesType;
  /**
   * Pass a string to render text as content in the divider. Mutually exclusive with icon. If both are set, text will render over the icon.
   */
  text?: string;
}

export interface DividerTokens extends DividerCoreProps, LayoutTokens {
  /**
   * The color of the content passed into the divider. This is overriden if the 'color' prop / token is set.
   */
  contentColor?: ColorValue;
  /**
   * The padding of divider content between the start and end lines. This should not be set if content isn't being passed into the divider.
   */
  contentPadding?: string | number;
  /**
   * The flex value of the line after content, set to 0 if 'alignContent' = 'end'.
   */
  flexAfter?: number;
  /**
   * The flex value of the line before content, set to 0 if 'alignContent' = 'start'.
   */
  flexBefore?: number;
  /**
   * Color of the divider lines. This is overriden if the 'color' prop / token is set.
   */
  lineColor?: ColorValue;
  /**
   * The thickness of the Divider lines.
   */
  thickness?: number;
  /**
   * -- States applied to the Divider --
   */
  alignStart?: DividerTokens;
  alignEnd?: DividerTokens;
  hasChildren?: DividerTokens;
  isVertical?: DividerTokens;
  default?: DividerTokens;
  subtle?: DividerTokens;
  brand?: DividerTokens;
  strong?: DividerTokens;
}

export interface DividerSlotProps {
  root: ViewProps;
  beforeLine: ViewProps;
  afterLine: ViewProps;
  text: TextProps;
  icon: IconProps;
}

export interface DividerType {
  props: DividerProps;
  tokens: DividerTokens;
  slotProps: DividerSlotProps;
}
