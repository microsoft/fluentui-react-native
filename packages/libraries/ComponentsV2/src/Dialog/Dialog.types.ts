import type * as React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import type {InteractionEvent} from '@fluentui/react-native';

export type DialogModalType = 'modal' | 'non-modal' | 'alert';
export type DialogBackdropAppearance = 'dimmed' | 'opaque' | 'transparent';

export interface DialogOpenChangeData {
  open: boolean;
  reason: 'backdropClick' | 'closeButton' | 'programmatic' | 'trigger';
}

export interface DialogProps {
  actions?: React.ReactNode;
  backdropAppearance?: DialogBackdropAppearance;
  children?: React.ReactNode;
  closeLabel?: string;
  defaultOpen?: boolean;
  modalType?: DialogModalType;
  onOpenChange?: (event: InteractionEvent, data: DialogOpenChangeData) => void;
  open?: boolean;
  preventClose?: boolean;
  style?: StyleProp<ViewStyle>;
  title?: React.ReactNode;
  titleAction?: React.ReactNode;
  trigger?: React.ReactNode;
}
