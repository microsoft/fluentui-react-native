import type { ReactNode } from 'react';
import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { ButtonShape, ButtonSize, ButtonState } from '../button/button.types';
import type { CommandPress } from '../button/commandPress';
import type { MenuButtonState } from '../menu-button/menu-button.types';
import type { MenuStateProps, MenuSurfaceProps } from '../menu/menu.types';

export type SplitButtonAppearance = 'primary' | 'secondary' | 'outline';
export type SplitButtonProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> &
  Pick<MenuStateProps, 'open' | 'defaultOpen' | 'onOpenChange'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    content: string;
    menuLabel: string;
    onPress: CommandPress;
    children: ReactNode;
    menu?: MenuSurfaceProps;
    size?: ButtonSize;
    shape?: ButtonShape;
    appearance?: SplitButtonAppearance;
    disabled?: boolean;
    primaryTestID?: string;
    menuTriggerTestID?: string;
  };

export type SplitButtonState = ThemeState &
  Required<Pick<SplitButtonProps, 'appearance' | 'size' | 'shape'>> &
  ComponentState<{ root: Slot<typeof View>; divider: Slot<typeof View> }> & {
    primary: ButtonState;
    menuButton: MenuButtonState;
    userStyle?: StyleProp<ViewStyle>;
    hasNames: boolean;
  };
