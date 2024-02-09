import type * as React from 'react';
import type { LayoutChangeEvent } from 'react-native';

export const overflowName = 'Tooltip';

export type OverflowProps = React.PropsWithChildren<{
  overflowAxis?: 'horizontal' | 'vertical';
  overflowDirection?: 'start' | 'end';
  padding?: number;
  minimumVisible?: number;
}>;

export const overflowItemName = 'OverflowItem';

export type OverflowItemProps = React.PropsWithChildren<{
  id: string;
}>;

export interface OverflowContextType {
  itemVisibility: { [itemId: string]: boolean };
  hasOverflow: boolean;
  registerItem: (id: string, onItemLayout: (e: LayoutChangeEvent) => void) => void;
  updateOverflow: () => void;
}
