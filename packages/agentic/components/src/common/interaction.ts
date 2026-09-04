import type { PressableProps } from 'react-native';

export type NativeFocusPressableProps = PressableProps & {
  enableFocusRing: boolean;
};

/**
 * RNW 0.81 crashes when its native focus ring creates border visuals after mount.
 */
export const disableNativeFocusRingProps = {
  enableFocusRing: false,
} as const satisfies Pick<NativeFocusPressableProps, 'enableFocusRing'>;

export function resolveFocusable(focusable: boolean | undefined, disabled: boolean): boolean {
  return !disabled && (focusable ?? true);
}
