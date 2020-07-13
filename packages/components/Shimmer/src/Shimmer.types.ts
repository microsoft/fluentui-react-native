import * as React from 'react';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { IForegroundColorTokens, ITextTokens } from '@fluentui-react-native/tokens';
import { ITextProps } from '@fluentui-react-native/text';
import { IFocusable, IPressableState, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { IViewWin32Props } from '@office-iss/react-native-win32';

export const ShimmerName = 'RNFShimmer';

/**
 * Properties for fabric native Shimmer
 */

export type IShimmerTokens = IForegroundColorTokens & ITextTokens;

/**
 * Because style state updates are coming from the touchable and will cause a child render the Shimmer doesn't use
 * changes in state value to trigger re-render.  The values inside inner are effectively mutable and are used
 * for per-component storage.
 */
export type IShimmerState = IPressableState & {
  /**
   * Specifies whether the Shimmer has been visited.
   * @default false
   */
  visited?: boolean;
};

export interface IShimmerInfo {
  /**
   * Specifies whether the Shimmer has clickable text to display.
   * @default false
   */
  content?: boolean;
}

export interface IShimmerOptions {
  /**
   * The URL that is opened when the Shimmer is clicked.  This value supersedes the 'onPress' callback when both are present.
   * @default undefined
   */
  url?: string;
}

export type IWithShimmerOptions<T extends object> = IShimmerOptions & IWithPressableOptions<T>;

export interface IShimmerProps extends IWithShimmerOptions<ITextProps> {
  /**
   * The visible text of the Shimmer that the user sees.
   * @default undefined
   */
  content?: string;
  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;
}

export type IShimmerSlotProps = {
  root: React.PropsWithRef<IViewWin32Props>;
  content: ITextProps;
};

export type IShimmerRenderData = IRenderData<IShimmerSlotProps, IShimmerState & IShimmerInfo>;

export interface IShimmerType {
  props: IShimmerProps;
  slotProps: IShimmerSlotProps;
  tokens: IShimmerTokens;
  state: IShimmerState & IShimmerInfo;
}
