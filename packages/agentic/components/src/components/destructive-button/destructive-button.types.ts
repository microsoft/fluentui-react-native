import type { PropsWithRefOf } from '@fluentui-react-native/framework-base';
import type { Pressable, PressableProps } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { IconProps } from '../../primitives/icon/icon.types';
import type { ButtonShape, ButtonSize, ButtonState } from '../button/button.types';

export type DestructiveButtonAppearance = 'subtle' | 'primary';
export type DestructiveButtonShape = ButtonShape;
export type DestructiveButtonSize = ButtonSize;

type DecorativeIcon = Extract<IconProps, { imageSource: unknown } | { fontSource: unknown } | { svgSource: unknown }>;
type CommandContent =
  | { content: string; leadingIcon?: DecorativeIcon; trailingIcon?: DecorativeIcon; accessibilityLabel?: string }
  | { content?: never; leadingIcon: DecorativeIcon; trailingIcon?: never; accessibilityLabel: string };

export type DestructiveButtonProps = DesktopTooltipProps &
  Pick<PressableProps, 'testID' | 'nativeID' | 'style' | 'onPress' | 'onFocus' | 'onBlur'> &
  CommandContent & {
    ref?: PropsWithRefOf<typeof Pressable>['ref'];
    appearance?: DestructiveButtonAppearance;
    size?: DestructiveButtonSize;
    shape?: DestructiveButtonShape;
    disabled?: boolean;
  };

export type DestructiveButtonState = ButtonState & { appearance: DestructiveButtonAppearance; hasCommand: boolean };
