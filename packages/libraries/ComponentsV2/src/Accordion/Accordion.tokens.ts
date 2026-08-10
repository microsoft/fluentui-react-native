import type { TextStyle, ViewStyle } from 'react-native';

import type { AccordionHeaderSize } from './Accordion.types';

export interface AccordionHeaderSizeTokens {
  expandIconSize: number;
  fontSize: number;
  fontWeight: TextStyle['fontWeight'];
  gap: number;
  lineHeight: number;
  minHeight: number;
  paddingHorizontal: number;
  paddingVertical: number;
}

export const accordionHeaderSizeTokens: Record<AccordionHeaderSize, AccordionHeaderSizeTokens> = {
  small: {
    expandIconSize: 16,
    fontSize: 12,
    fontWeight: '600',
    gap: 8,
    lineHeight: 16,
    minHeight: 32,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  medium: {
    expandIconSize: 20,
    fontSize: 14,
    fontWeight: '600',
    gap: 8,
    lineHeight: 20,
    minHeight: 36,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  large: {
    expandIconSize: 20,
    fontSize: 16,
    fontWeight: '600',
    gap: 10,
    lineHeight: 22,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  'extra-large': {
    expandIconSize: 24,
    fontSize: 20,
    fontWeight: '600',
    gap: 12,
    lineHeight: 28,
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
};

export const accordionPanelTokens: ViewStyle = {
  paddingBottom: 12,
  paddingHorizontal: 12,
  paddingTop: 4,
};

export const accordionMotionDuration = 200;
