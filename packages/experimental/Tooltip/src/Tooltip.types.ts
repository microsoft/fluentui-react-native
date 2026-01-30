import type * as React from 'react';
import type { ViewStyle, ViewProps } from 'react-native';

import type { DirectionalHint } from '@fluentui-react-native/callout';

export const tooltipName = 'Tooltip';

export type TooltipProps = React.PropsWithChildren<{
  /**
   * The text of the tooltip.
   */
  content: string;

  /**
   * Notification when the visibility of the tooltip is changed.
   */
  onVisibleChange?: (event, data) => void;

  /**
   * Positioning of the tooltip relative to the target element.
   *
   * @default topCenter
   */
  positioning?: DirectionalHint;

  /**
   * Allow consumers to pass in Style props
   */
  style?: ViewStyle;

  /**
   * Target anchor that tooltip uses for relative positioning. Certain components may proffer a string as an anchor target, such as
   * anchoring to a point inside the component.
   *
   * If not provided, will anchor to the wrapper element.
   */
  target?: React.RefObject<React.Component> | string;

  /**
   * Controls the tooltip visibility and can be used in conjunction with onVisibleChange to modify show/hide behavior. If not provided, will be updated based on hover/focus events on target element.
   *
   * @default false
   */
  visible?: boolean;
}>;

export interface TooltipSlotProps {
  root: TooltipProps;
}

export interface TooltipType {
  props: TooltipProps;
  slotProps: TooltipSlotProps;
}

export interface NativeProps extends ViewProps {
  content?: string;
}
