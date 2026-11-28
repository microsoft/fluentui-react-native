import type { ReactNode } from 'react';
import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { ScrollView, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { Button } from '../button/button';
import type { Text } from '../text/text';

export type DrawerPosition = 'start' | 'end' | 'bottom';
export type DrawerSize = 'small' | 'medium' | 'large' | 'full' | 'custom';
type Extent = { size?: Exclude<DrawerSize, 'custom'>; customSize?: never } | { size: 'custom'; customSize: number };
export type DrawerProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> &
  Extent & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    position?: DrawerPosition;
    availableExtent?: number;
    title: string;
    children?: ReactNode;
    footer?: ReactNode;
    closeLabel?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, data: { reason: 'close' }) => void;
    onCloseFocus?: () => void;
    closeTestID?: string;
  };

export type DrawerState = ThemeState &
  ComponentState<{
    root: Slot<typeof View>;
    header: Slot<typeof View>;
    heading: Slot<typeof View>;
    title: Slot<typeof Text>;
    body: Slot<typeof ScrollView>;
    footer: OptionalSlot<typeof View>;
    close: OptionalSlot<typeof Button>;
  }> & {
    open: boolean;
    position: DrawerPosition;
    size: DrawerSize;
    customSize?: number;
    availableExtent?: number;
    children?: ReactNode;
    userStyle?: StyleProp<ViewStyle>;
  };
