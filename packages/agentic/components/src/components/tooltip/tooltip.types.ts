import type { ComponentRef, ReactElement, Ref } from 'react';
import type { View, ViewProps } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';

type TriggerRef = Ref<ComponentRef<typeof View>>;
type TriggerProps = DesktopTooltipProps &
  Pick<ViewProps, 'accessibilityLabel' | 'aria-label' | 'accessibilityHint'> & {
    accessibilityDescription?: string;
    ref?: TriggerRef;
  };

export interface TooltipProps {
  content: string;
  children: ReactElement<TriggerProps>;
  ref?: TriggerRef;
}

export interface TooltipState {
  trigger: ReactElement<TriggerProps>;
  nativeProps: TriggerProps;
}
