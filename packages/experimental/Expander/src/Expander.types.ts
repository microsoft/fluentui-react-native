import { ColorValue } from 'react-native';

export const expanderName = 'Expander';

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
   * Content for the header
   * TODO: what types of content etc.
   */
  header?: string;
  /*
   * Content displayed after expanded
   * TODO: what types of content etc.
   */
  content?: string;
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
