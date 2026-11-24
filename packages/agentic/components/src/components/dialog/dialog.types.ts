import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { DialogWindow } from '@fluentui-react-native/native-core/macos';
import type { ReactNode, RefObject } from 'react';
import type { ScrollView, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { Button } from '../button/button';
import type { Text } from '../text/text';

export type DialogType = 'modal' | 'nonmodal' | 'alert';
export type DialogOpenChangeReason = 'dismiss' | 'resolve' | 'native-close';
export type DialogAction = {
  key: string;
  label: string;
  testID?: string;
  appearance?: 'primary' | 'secondary' | 'subtle';
  onPress?: () => void;
};
type FocusRef = RefObject<{ focus(): void } | null>;

export type DialogProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    type?: DialogType;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, details: { reason: DialogOpenChangeReason }) => void;
    title: string;
    children?: ReactNode;
    actions?: readonly DialogAction[];
    closeLabel?: string;
    onDismissRequest?: () => void;
    windowTestID?: string;
    triggerRef?: FocusRef;
    initialFocusRef?: FocusRef;
    returnFocusRef?: FocusRef;
  };

export type DialogState = ThemeState &
  ComponentState<{
    root: Slot<typeof View>;
    window: Slot<typeof DialogWindow>;
    surface: Slot<typeof View>;
    header: Slot<typeof View>;
    title: Slot<typeof Text>;
    close: OptionalSlot<typeof Button>;
    body: OptionalSlot<typeof ScrollView>;
    footer: OptionalSlot<typeof View>;
  }> & {
    actions: readonly DialogAction[];
    children?: ReactNode;
    approve(action: DialogAction): void;
    width: number;
    height: number;
    stackFooter: boolean;
    userStyle?: StyleProp<ViewStyle>;
  };
