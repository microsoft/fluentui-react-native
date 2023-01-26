import { ViewProps, ColorValue } from 'react-native';
import { IconPropsV1 } from '@fluentui-react-native/icon';
import { LayoutTokens } from '@fluentui-react-native/tokens';
import { TextProps } from '@fluentui-react-native/text';

export const dividerName = 'Divider';

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
   * Default: `0`
   */
  insetSize?: DividerInsetSize;
  /**
   * Whether the divider is rendered as a horizontal line or a vertical line.
   * Default: `false`
   */
  vertical?: boolean;
}

export interface DividerProps extends DividerCoreProps {
  /**
   * If a text or icon is passed, this dictates where content appears in the divider: at the start, centered, or towards the end.
   * Default: `center`
   */
  alignContent?: DividerAlignment;
  /**
   * If no color is passed, the divider and its content are colored using different theme tokens depending on the value of this prop.
   * Default: `default`
   */
  appearance?: DividerAppearance;
  /**
   * Pass an icon source to render an icon as content in the divider. Mutually exclusive with passing text as a child.
   */
  icon?: IconPropsV1;
}

export interface DividerTokens extends DividerCoreProps, LayoutTokens {
  /**
   * The color of the content passed into the divider. This is overriden if the `color` prop / token is set.
   */
  contentColor?: ColorValue;
  /**
   * The padding of divider content between the start and end lines.
   * Default = `8`.
   */
  contentPadding?: string | number;
  /**
   * The flex value of the line after content, set to 0 if `alignContent` = `end`.
   */
  flexAfter?: number;
  /**
   * The flex value of the line before content, set to 0 if `alignContent` = `start`.
   */
  flexBefore?: number;
  /**
   * Color of the divider lines. This is overriden if the `color` prop / token is set.
   */
  lineColor?: ColorValue;
  /**
   * The thickness of the Divider lines
   * Default: `1px`.
   */
  thickness?: number;
}

export interface DividerSlotProps {
  root: ViewProps;
  beforeLine: ViewProps;
  afterLine: ViewProps;
  wrapper: ViewProps;
  text: TextProps;
  icon: IconPropsV1;
}

export interface DividerType {
  props: DividerProps;
  tokens: DividerTokens;
  slotProps: DividerSlotProps;
}
