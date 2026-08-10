import type * as React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import type {InteractionEvent} from '@fluentui/react-native';

export type DrawerPosition = 'start' | 'end';
export type DrawerSize = 'small' | 'medium' | 'large' | 'full';
export type DrawerType = 'inline' | 'overlay';

export interface DrawerOpenChangeData {
  open: boolean;
  reason: 'backdropClick' | 'closeButton' | 'programmatic';
}

export interface DrawerProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  modal?: boolean;
  onOpenChange?: (event: InteractionEvent, data: DrawerOpenChangeData) => void;
  open?: boolean;
  position?: DrawerPosition;
  preventClose?: boolean;
  separator?: boolean;
  size?: DrawerSize | number;
  style?: StyleProp<ViewStyle>;
  title?: React.ReactNode;
  type?: DrawerType;
}
