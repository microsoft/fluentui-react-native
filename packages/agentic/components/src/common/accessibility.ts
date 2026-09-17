import type { AccessibilityProps } from 'react-native';

export type AccessibleNameProps = Pick<
  AccessibilityProps,
  'accessibilityLabel' | 'accessibilityLabelledBy' | 'aria-label' | 'aria-labelledby'
>;

export const hiddenFromAccessibilityProps = {
  accessibilityElementsHidden: true,
  accessible: false,
  importantForAccessibility: 'no-hide-descendants',
} as const satisfies AccessibilityProps;

export function hasAccessibleName(props: AccessibleNameProps): boolean {
  return (
    props.accessibilityLabel !== undefined ||
    props.accessibilityLabelledBy !== undefined ||
    props['aria-label'] !== undefined ||
    props['aria-labelledby'] !== undefined
  );
}

export function hideSlotProps<TProps extends { ref?: unknown; testID?: string }>(props: TProps): TProps {
  return {
    ...props,
    ...hiddenFromAccessibilityProps,
    ref: undefined,
    testID: undefined,
  };
}
