import * as React from 'react';

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
  const hasWarnedRef = React.useRef(false);
  const labelIsMissing = requireLabel && !accessibilityLabel && !accessibilityLabelledBy;

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    if (!labelIsMissing) {
      hasWarnedRef.current = false;
      return;
    }

    if (hasWarnedRef.current) {
      return;
    }

    hasWarnedRef.current = true;
    console.warn(warning ?? `${componentName}: accessibilityLabel is required.`);
  }, [componentName, labelIsMissing, warning]);
}
