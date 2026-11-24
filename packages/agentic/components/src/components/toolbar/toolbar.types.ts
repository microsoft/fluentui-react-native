import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { ReactElement, ReactNode } from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { KeyedFocus } from '../../common/useKeyedFocus';
import type { ButtonProps } from '../button/button.types';
import type { DividerProps } from '../divider/divider.types';
import type { ToggleButtonProps } from '../toggle-button/toggle-button.types';

export type ToolbarSize = 'small' | 'large';
export type ToolbarProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    children: ReactNode;
    accessibilityLabel: string;
    size?: ToolbarSize;
  };

export type ToolbarItem =
  | { kind: 'button'; value: string; disabled: boolean; element: ReactElement<ButtonProps> }
  | { kind: 'toggle'; value: string; disabled: boolean; element: ReactElement<ToggleButtonProps> }
  | { kind: 'divider'; value: string; element: ReactElement<DividerProps> };

export type ToolbarState = ThemeState &
  ComponentState<{ root: Slot<typeof View> }> & {
    items: ToolbarItem[];
    focus: KeyedFocus;
    size: ToolbarSize;
    userStyle?: StyleProp<ViewStyle>;
  };
