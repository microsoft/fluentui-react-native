import type * as React from 'react';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IFocusable, IPressableState, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import type { ITextProps } from '@fluentui-react-native/text';
import type { IForegroundColorTokens, FontTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import type { IRenderData } from '@uifabricshared/foundation-composable';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ObjectBase = {};

export const linkName = 'RNFLink';

/**
 * Properties for fabric native Link
 */

export type ILinkTokens = IForegroundColorTokens & FontTokens & IBorderTokens;

/**
 * Because style state updates are coming from the touchable and will cause a child render the link doesn't use
 * changes in state value to trigger re-render.  The values inside inner are effectively mutable and are used
 * for per-component storage.
 */
export type ILinkState = IPressableState & {
  /**
   * Specifies whether the link has been visited.
   * @default false
   */
  visited?: boolean;
};

export interface ILinkInfo {
  /**
   * Specifies whether the link has clickable text to display.
   * @default false
   */
  content?: boolean;
}

export interface ILinkOptions {
  /**
   * The URL that is opened when the link is clicked.  This value supersedes the 'onPress' callback when both are present.
   * @default undefined
   */
  url?: string;
}

export type IWithLinkOptions<T extends ObjectBase> = ILinkOptions & IWithPressableOptions<T>;

export interface ILinkProps extends IWithLinkOptions<ITextProps> {
  /**
   * The visible text of the link that the user sees.
   * @default undefined
   */
  content?: string;
  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;
}

export type ILinkSlotProps = {
  root: React.PropsWithRef<IViewProps>;
  content: ITextProps;
};

export type ILinkRenderData = IRenderData<ILinkSlotProps, ILinkState & ILinkInfo>;

export interface ILinkType {
  props: ILinkProps;
  slotProps: ILinkSlotProps;
  tokens: ILinkTokens;
  state: ILinkState & ILinkInfo;
}
