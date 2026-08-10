import type * as React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

export type DividerAppearance = 'default' | 'subtle' | 'brand' | 'strong';
export type DividerAlignContent = 'start' | 'center' | 'end';
export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps {
  alignContent?: DividerAlignContent;
  appearance?: DividerAppearance;
  children?: React.ReactNode;
  inset?: number;
  orientation?: DividerOrientation;
  style?: StyleProp<ViewStyle>;
}
