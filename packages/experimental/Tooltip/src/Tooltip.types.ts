import type * as React from 'react';

export const tooltip = 'Tooltip';

/**
 * Properties and Tokens for FluentUI React Native Tooltip
 */
export type DirectionalHint =
  | 'leftTopEdge'
  | 'leftCenter'
  | 'leftBottomEdge'
  | 'topLeftEdge'
  | 'topAutoEdge'
  | 'topCenter'
  | 'topRightEdge'
  | 'rightTopEdge'
  | 'rightCenter'
  | 'rightBottomEdge'
  | 'bottonLeftEdge'
  | 'bottomAutoEdge'
  | 'bottomCenter'
  | 'bottomRightEdge';

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
   * Target node that tooltip uses for relative positioning.
   */
  target?: React.RefObject<React.Component>;

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
