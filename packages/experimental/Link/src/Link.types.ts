import { TextTokens, TextProps } from '@fluentui-react-native/text';
import { IFocusable, IPressableState, IWithPressableEvents } from '@fluentui-react-native/interactive-hooks';
import { ViewProps } from 'react-native';

export const linkName = 'Link';

export type LinkState = IPressableState & {
  /**
   * Specifies whether the link has been visited.
   * @default false
   */
  visited?: boolean;
  /**
   * Specifies whether the link is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Specifies whether the link is inline.
   * @default false
   */
  inline?: boolean;
  /**
   * Specifies whether the link is subtle.
   * @default false
   */
  subtle?: boolean;
};

/**
 * Link tokens, these are the internally configurable values for Link elements. In particular these
 * drive decisions on how to build the styles
 */
export interface LinkTokens extends TextTokens {
  hovered?: LinkTokens;
  pressed?: LinkTokens;
  focused?: LinkTokens;
  visited?: LinkTokens;
  disabled?: LinkTokens;
  inline?: LinkTokens;
  subtle?: LinkTokens;
}

export type LinkAppearance = 'default' | 'subtle';

/**
 * Link props, extending Text props with Pressable options
 */
export interface LinkProps extends TextProps {
  /**
   * link appearance
   */
  appearance?: LinkAppearance;
  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;
  /**
   * Whether to use native focus visuals for the component
   * @default true
   */
  enableFocusRing?: boolean;
  /**
   * link inline
   */
  inline?: boolean;
  /**
   * The URL that is opened when the link is clicked.  This value supersedes the 'onPress' callback when both are present.
   * @default undefined
   */
  url?: string;
  /**
   * Text that should show in a tooltip when the user hovers over a button.
   */
  tooltip?: string;
}

export type LinkInfo = {
  props: IWithPressableEvents<LinkProps & React.ComponentPropsWithRef<any>>;
  state: LinkState;
};

export interface LinkSlotProps {
  root: ViewProps;
  content: TextProps;
}

export interface LinkType {
  props: LinkProps;
  tokens: LinkTokens;
  slotProps: LinkSlotProps;
}
