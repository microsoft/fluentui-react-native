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

export interface TooltipTokens {}

export interface TooltipProps {
  content: string;
  target?: React.RefObject<React.Component>;
  appearance?: 'normal' | 'inverted';
  // hideDelay?: number;
  onVisibleChange?: (event, data) => void;
  positioning?: DirectionalHint;
  relationship: 'label' | 'description' | 'inaccessible';
  // showDelay: number;
  visible: boolean;
  withArrow: boolean;
}

export interface TooltipSlotProps {
  root: TooltipProps;
}

export interface TooltipType {
  props: TooltipProps;
  tokens: TooltipTokens;
  slotProps: TooltipSlotProps;
}
