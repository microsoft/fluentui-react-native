import { TextTokens, TextProps } from '@fluentui-react-native/text';
import { IFocusable, IPressableState, IWithPressableEvents, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { ViewProps } from 'react-native';

export const linkName = 'Link';

export type ILinkState = IPressableState & {
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
  subtle?: boolean

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

export interface LinkOptions {
  /**
   * The URL that is opened when the link is clicked.  This value supersedes the 'onPress' callback when both are present.
   * @default undefined
   */
  url?: string;
}


// eslint-disable-next-line @typescript-eslint/ban-types
export type IWithLinkOptions<T extends object> = LinkOptions & IWithPressableOptions<T>;

/**
 * Link props, extending Text props with Pressable options
 */
export interface LinkCoreProps extends IWithLinkOptions<TextProps> {
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
   * Text that should show in a tooltip when the user hovers over a button.
   */
  tooltip?: string;
}

export interface LinkProps extends LinkCoreProps {
  /**
   * link appearance
   */
  appearance?: LinkAppearance;
  /*
   * link inline
   */
  inline?: boolean;
}

export type LinkHooks<T extends object> = {
  props: IWithPressableEvents<T>;
  state: ILinkState;
};
export type LinkState = LinkHooks<LinkProps & React.ComponentPropsWithRef<any>>;

export interface LinkSlotProps {
  root: ViewProps;
  content: TextProps;
}

export interface LinkType {
  props: LinkProps;
  tokens: LinkTokens;
  slotProps: LinkSlotProps;
}


