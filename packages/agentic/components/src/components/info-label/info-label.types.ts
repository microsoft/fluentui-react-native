import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, OptionalSlot, Slot } from '@fluentui-react-native/framework-base';
import type { ReactNode } from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';
import type { ButtonProps } from '../button/button.types';
import type { Label } from '../label/label';
import type { LabelProps, LabelSize } from '../label/label.types';
import type { Popover } from '../popover/popover';
import type { PopoverStateProps } from '../popover/popover.types';
import type { Text } from '../text/text';

export type InfoLabelHelp = Pick<PopoverStateProps, 'open' | 'defaultOpen' | 'onOpenChange'> & {
  triggerLabel: string;
  surfaceLabel?: string;
  children: ReactNode;
};

export type InfoLabelProps = LabelProps & { help: InfoLabelHelp };

export type InfoLabelState = ThemeState &
  ComponentState<{
    root: Slot<typeof View>;
    label: Slot<typeof Label>;
    help: OptionalSlot<typeof Popover>;
    helpText: OptionalSlot<typeof Text>;
  }> & {
    size: LabelSize;
    helpContent: ReactNode;
    surfaceLabel: string;
    triggerProps: Pick<ButtonProps, 'accessibilityLabel' | 'disabled'>;
    userStyle?: StyleProp<ViewStyle>;
  };
