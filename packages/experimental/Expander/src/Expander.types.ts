import type { PropsWithChildren } from 'react';
import type { ColorValue } from 'react-native';
import type { NativeProps } from './ExpanderNativeComponent';

export const expanderName = 'Expander';

/*
 * General notes:
 * The Expander header will be consumed as the first child element of the Expander
 * The Expander content will be consumed as the second child element of the Expander
 * To include more complex layouts for the header or content, wrap multiple header/content elements inside of a <View>
 */

export type ExpanderProps = PropsWithChildren<{
  /**
   * Direction to expand the Expander.
   */
  expandDirection?: ExpandDirection;
  /**
   * Determines if the expander is currently expanded
   */
  expanded?: boolean;
  /**
   * Is Expander control enabled for the user
   */
  enabled?: boolean;
  /**
   * Height of the Expander
   */
  height?: number;
  /**
   * Height for the Expander when expanded
   */
  expandedHeight: number;
  /**
   * Height for the Expander when collapsed
   */
  collapsedHeight: number;
  /**
   * A callback to call on Expander collapsed event
   */
  onCollapsing?: () => void;
  /**
   * A callback to call on Expander expanding event
   */
  onExpanding?: () => void;
}>;

export interface ExpanderTokens {
  /**
   * Width of the expander
   */
  width?: number;
  /**
   * Horizontal alignment of the expander's content
   */
  contentHorizontalAlignment?: HorizontalAlignment;
  /**
   * Vertical alignment of the expander's content
   */
  contentVerticalAlignment?: VerticalAlignment;
  /**
   * Header background color
   */
  headerBackground?: ColorValue;
  /**
   * Header foreground color at rest
   */
  headerForeground?: ColorValue;
  /**
   * Header foreground color on pointer over
   */
  headerForegroundPointerOver?: ColorValue;
  /**
   * Header foreground color when pressed
   */
  headerForegroundPressed?: ColorValue;
  /**
   * Header border color at rest
   */
  headerBorderBrush?: ColorValue;
  /**
   * Header border color on pointer over
   */
  headerBorderPointerOverBrush?: ColorValue;
  /**
   * Header border color when pressed
   */
  headerBorderPressedBrush?: ColorValue;
  /**
   * Header foreground color when disabled
   */
  headerDisabledForeground?: ColorValue;
  /**
   * Header border color when disabled
   */
  headerDisabledBorderBrush?: ColorValue;
  /**
   * Header border thickness
   */
  headerBorderThickness?: number;
  /**
   * Content background color
   */
  contentBackground?: ColorValue;
  /**
   * Content border color
   */
  contentBorderBrush?: ColorValue;
  /**
   * Chevron background color at rest
   */
  chevronBackground?: ColorValue;
  /**
   * Chevron foreground color at rest
   */
  chevronForeground?: ColorValue;
  /**
   * Chevron background color on pointer over
   */
  chevronPointerOverBackground?: ColorValue;
  /**
   * Chevron foreground color on pointer over
   */
  chevronPointerOverForeground?: ColorValue;
  /**
   * Chevron background color when pressed
   */
  chevronPressedBackground?: ColorValue;
  /**
   * Chevron foreground color when pressed
   */
  chevronPressedForeground?: ColorValue;
  /**
   * Chevron border thickness
   */
  chevronBorderThickness?: number;
  /**
   * Chevron border color at rest
   */
  chevronBorderBrush?: ColorValue;
  /**
   * Chevron border color on pointer over
   */
  chevronBorderPointerOverBrush?: ColorValue;
  /**
   * Chevron border color when pressed
   */
  chevronBorderPressedBrush?: ColorValue;
}

export type ExpandDirection = 'up' | 'down';
export type VerticalAlignment = 'bottom' | 'center' | 'stretch' | 'top';
export type HorizontalAlignment = 'center' | 'left' | 'right' | 'stretch';
export type ExpanderViewProps = ExpanderProps & ExpanderTokens;

export interface ExpanderType {
  props: ExpanderProps;
  tokens: ExpanderTokens;
  slotProps: {
    root: NativeProps;
  };
}
