import type { AccessibilityProps } from 'react-native';

export const hiddenFromAccessibilityProps = {
  accessibilityElementsHidden: true,
  accessible: false,
  importantForAccessibility: 'no-hide-descendants',
} as const satisfies AccessibilityProps;

export function hideSlotProps<TProps extends { ref?: unknown; testID?: string }>(props: TProps): TProps {
  return {
    ...props,
    ...hiddenFromAccessibilityProps,
    ref: undefined,
    testID: undefined,
  };
}
