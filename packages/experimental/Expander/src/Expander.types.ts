import { ColorValue } from 'react-native';
import type {SyntheticEvent} from 'react-native/Libraries/Types/CoreEventTypes';

export const expanderName = 'Expander';

/*
  * General notes:
  * The Expander header will be consumed as the first child element of the Expander
  * The Expander content will be consumed as the second child element of the Expander
  * To include more complex layouts for the header or content, wrap multiple header/content elements inside of a <View>
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
   * TODO: reference id for the header component
   */
  headerRef?: number;
  /*
   * TODO: reference id for the content component
   */
  contentRef?: number;
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
   * Height for the Expander when expanded
   */
  expandedHeight?: number;
  /*
   * Height for the Expander when collapsed
   */
  collapsedHeight?: number;
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

export type ExpanderChangeEvent = SyntheticEvent<
  Readonly <{
    nativeEvent: {
      expanded: boolean
    },
  }>
>;

export interface ExpanderType {
  props: ExpanderProps;
  tokens: ExpanderTokens;
  slotProps: {
    root: ExpanderViewProps;
  };
}
