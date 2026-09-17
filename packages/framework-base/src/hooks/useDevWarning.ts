import * as React from 'react';

export type DevWarningSeverity = 'warn' | 'error';

/**
 * Warns during development when `condition` is true. Warns only once for a continuous run of
 * `true`; when `condition` becomes `false`, the warning resets so a later transition back to
 * `true` can warn again. This is a no-op in production builds.
 */
export function useDevWarning(condition: boolean, warning: string, severity: DevWarningSeverity = 'warn'): void {
  const hasWarnedRef = React.useRef(false);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    if (!condition) {
      hasWarnedRef.current = false;
      return;
    }

    if (hasWarnedRef.current) {
      return;
    }

    hasWarnedRef.current = true;
    console[severity](warning);
  }, [condition, severity, warning]);
}
