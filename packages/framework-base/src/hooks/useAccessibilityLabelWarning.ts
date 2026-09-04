import { useDevWarning } from './useDevWarning';

export type AccessibilityLabelWarningOptions = {
  componentName: string;
  accessibilityLabel?: string | null;
  accessibilityLabelledBy?: string | readonly string[] | null;
  requireLabel?: boolean;
  warning?: string;
};

/**
 * Warns during development when a component requires an accessibility label but does not receive one.
 */
export function useAccessibilityLabelWarning({
  componentName,
  accessibilityLabel,
  accessibilityLabelledBy,
  requireLabel = false,
  warning,
}: AccessibilityLabelWarningOptions): void {
  const labelIsMissing = requireLabel && !accessibilityLabel && !accessibilityLabelledBy;

  useDevWarning(labelIsMissing, warning ?? `${componentName}: accessibilityLabel is required.`);
}
