import type { ViewProps } from 'react-native';

import type { IFocusable, IPressableState, IWithPressableEvents, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import type { TextTokens, TextProps } from '@fluentui-react-native/text';

export const linkName = 'Link';

export type LinkState = IPressableState & {
  /**
   * Specifies whether the link has been visited.
   * Note: Not supported for Android
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
   * Note: Not supported for win32
   *
   * @default false
   */
  inline?: boolean;
  /**
   * Specifies whether the link is subtle.
   * Note: Not supported for Android
   * @default false
   */
  subtle?: boolean;
};

/**
 * Link tokens, these are the internally configurable values for Link elements. In particular these
 * drive decisions on how to build the styles
 * Note: 'hovered','focused','visited','subtle' are not supported for Android
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
export interface LinkProps extends IWithPressableOptions<TextProps> {
  /**
   * The appearance of the link, either `default` or `subtle`
   * Note: 'subtle' is not supported for Android
   * @default default
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
   * Whether the link is inline with text
   * Note: Not supported for win32
   * @default false
   */
  inline?: boolean;
  /**
   * The URL that is opened when the link is clicked.  This value supersedes the 'onPress' callback when both are present.
   * @default undefined
   */
  url?: string;
  /**
   * Text that should show in a tooltip when the user hovers over a button.
   * Note: Not supported for Android
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
