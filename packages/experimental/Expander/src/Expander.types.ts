import { ColorValue } from 'react-native';

export const expanderName = 'Expander';

/*
  * General notes:
  * The Expander header has been limited to hold an image and a title
  * The Expander content will be consumed as child elements of the Expander component
  */

export interface ExpanderProps {
  /*
   * Direction to expand the Expander.
   */
  expandDirection?: ExpandDirection;
  /*
   * Determines if the expander is currently expanded
   */
  expanded?: boolean;
  /*
   * Title for the header
   */
  headerTitle?: string;
  /*
   * Image for the header
   */
  headerImage?: string;
  /*
   * Is Expander control enabled for the user
   */
  enabled?: boolean;
  /*
   * Style of the expander control
   * TODO: do we want to have styles here? If so, make an enum
   */
  expanderStyle?: string;
  /*
   * A callback to call on Expander collapsed event
   */
  onCollapsed?: () => void;
  /*
   * A callback to call on Expander expanding event
   */
  onExpanding?: () => void;
}

export interface ExpanderTokens {
  /*
   * Expander background color
   * TODO: do we want to use this value for custom styling?
   */
  accentColor?: ColorValue;
}

export type ExpandDirection = 'up' | 'down';
export type ExpanderViewProps = ExpanderProps & ExpanderTokens;

export interface ExpanderType {
  props: ExpanderProps;
  tokens: ExpanderTokens;
  slotProps: {
    root: ExpanderViewProps;
  };
}
