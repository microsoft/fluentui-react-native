import { Platform } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import type { ButtonProps } from './button.types';

export type CommandPress = (event?: GestureResponderEvent) => void;

export function commandPressProps(
  onPress: CommandPress | null | undefined,
  disabled: boolean,
): Pick<ButtonProps, 'onPress' | 'onAccessibilityTap'> {
  const platform: string = Platform.OS;
  const desktop = platform === 'macos' || platform === 'windows' || platform === 'win32';
  return {
    onPress,
    onAccessibilityTap: desktop && !disabled && onPress ? () => onPress() : undefined,
  };
}
