import { DesktopCancelledError, DesktopDriverError } from '../errors.ts';
import type { DesktopExitReason, DesktopRunReport, DesktopTestResult } from '../types.ts';

export type DesktopTestStatus = DesktopTestResult['status'];

/** Maps host-side failures into the stable result taxonomy. */
export function statusForFailure(error: unknown, exitReason?: DesktopExitReason): DesktopTestStatus {
  if (error instanceof DesktopCancelledError) {
    return 'cancelled';
  }
  if (exitReason === 'timedOut') {
    return 'timed_out';
  }
  if (exitReason === 'crashed' || exitReason === 'lostProcess') {
    return 'failed';
  }
  if (error instanceof DesktopDriverError) {
    return error.kind === 'cancelled' ? 'cancelled' : 'infrastructureError';
  }
  return 'failed';
}

export function summarizeResults(results: readonly DesktopTestResult[]): DesktopRunReport['summary'] {
  return {
    passed: results.filter((result) => result.status === 'passed').length,
    failed: results.filter((result) => result.status === 'failed').length,
    skipped: results.filter((result) => result.status === 'skipped').length,
    cancelled: results.filter((result) => result.status === 'cancelled').length,
    timedOut: results.filter((result) => result.status === 'timed_out').length,
    infrastructureError: results.filter((result) => result.status === 'infrastructureError').length,
    durationMs: results.reduce((total, result) => total + result.durationMs, 0),
  };
}

export function runStateForResults(results: readonly DesktopTestResult[]): 'passed' | 'failed' | 'cancelled' | 'error' {
  if (results.some((result) => result.status === 'infrastructureError' || result.status === 'timed_out')) {
    return 'error';
  }
  if (results.some((result) => result.status === 'failed')) {
    return 'failed';
  }
  if (results.some((result) => result.status === 'cancelled')) {
    return 'cancelled';
  }
  return 'passed';
}
