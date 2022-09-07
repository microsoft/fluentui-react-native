import { TextTokens, TextProps } from '@fluentui-react-native/text';
import { IFocusable, IPressableState, IWithPressableEvents, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
// import { IconProps } from '@fluentui-react-native/icon';

export const linkName = 'Link';

/**
 * Link tokens, these are the internally configurable values for Link elements. In particular these
 * drive decisions on how to build the styles
 */
export type LinkTokens = TextTokens;

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
}

export interface LinkProps extends LinkCoreProps {
  /**
   * link appearance
   */
  apprearance?: LinkAppearance;
  /*
   * link inline
   */
  inline?: boolean;
}

export type ILinkState = IPressableState & {
  /**
   * Specifies whether the link has been visited.
   * @default false
   */
  visited?: boolean;
};

export type LinkHooks<T extends object> = {
  props: IWithPressableEvents<T>;
  state: ILinkState;
};
export type LinkState = LinkHooks<LinkProps & React.ComponentPropsWithRef<any>>;

export interface LinkSlotProps {
  root: TextProps;
  // icon: IconProps;
}

export interface LinkType {
  props: LinkProps;
  tokens: LinkTokens;
  slotProps: LinkSlotProps;
}


