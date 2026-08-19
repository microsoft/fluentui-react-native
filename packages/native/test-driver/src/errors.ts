/**
 * Error types for the desktop driver.
 *
 * Failures are classified so a reporter can separate a genuine test failure from an
 * infrastructure problem. A missing portable capability is always infrastructure, never a
 * silently skipped test.
 */

/** Classification attached to every desktop driver error. */
export type DesktopErrorKind =
  | 'configuration'
  | 'validation'
  | 'ownership'
  | 'driverHost'
  | 'lifecycle'
  | 'capability'
  | 'storybook'
  | 'cancelled';

export interface DesktopErrorOptions {
  kind: DesktopErrorKind;
  /** Bounded, already-redacted diagnostic payload. */
  detail?: Record<string, unknown>;
  cause?: unknown;
}

/** Base error for everything this package throws. */
export class DesktopDriverError extends Error {
  readonly kind: DesktopErrorKind;
  readonly detail?: Record<string, unknown>;

  constructor(message: string, options: DesktopErrorOptions) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'DesktopDriverError';
    this.kind = options.kind;
    this.detail = options.detail;
  }
}

/** Raised when portable configuration or a serializable plan fails validation. */
export class DesktopValidationError extends DesktopDriverError {
  readonly errors: readonly string[];

  constructor(message: string, errors: readonly string[], detail?: Record<string, unknown>) {
    super(`${message}${errors.length > 0 ? `: ${errors.join('; ')}` : ''}`, { kind: 'validation', detail });
    this.name = 'DesktopValidationError';
    this.errors = errors;
  }
}

/** Raised when a run is cancelled cooperatively. */
export class DesktopCancelledError extends DesktopDriverError {
  constructor(message = 'Desktop test run was cancelled') {
    super(message, { kind: 'cancelled' });
    this.name = 'DesktopCancelledError';
  }
}

/**
 * Wraps a primary failure so a cleanup failure can be appended without hiding the original
 * diagnosis.
 */
export function appendCleanupFailure(primary: unknown, cleanup: unknown): unknown {
  if (!cleanup) {
    return primary;
  }
  const cleanupMessage = cleanup instanceof Error ? cleanup.message : String(cleanup);
  if (primary instanceof Error) {
    primary.message = `${primary.message}\n[cleanup failure] ${cleanupMessage}`;
    return primary;
  }
  if (primary === undefined || primary === null) {
    return cleanup;
  }
  return new DesktopDriverError(`${String(primary)}\n[cleanup failure] ${cleanupMessage}`, { kind: 'lifecycle' });
}
