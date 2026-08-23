import type { DesktopTestResult } from '../../types.ts';

export const DESKTOP_RESULT_PREFIX = '@@desktop-driver-result@@';
export const DESKTOP_RESULT_STREAM_ENV = 'FURN_DESKTOP_RESULT_STREAM';

export function encodeDesktopResult(result: DesktopTestResult): string {
  return `${DESKTOP_RESULT_PREFIX}${JSON.stringify(result)}`;
}

export function decodeDesktopResult(line: string): DesktopTestResult | undefined {
  const marker = line.indexOf(DESKTOP_RESULT_PREFIX);
  if (marker < 0) {
    return undefined;
  }
  try {
    const value = JSON.parse(line.slice(marker + DESKTOP_RESULT_PREFIX.length)) as Partial<DesktopTestResult>;
    if (
      typeof value.testId !== 'string' ||
      typeof value.title !== 'string' ||
      typeof value.durationMs !== 'number' ||
      !['passed', 'failed', 'skipped', 'cancelled', 'timed_out', 'infrastructureError'].includes(String(value.status))
    ) {
      return undefined;
    }
    return value as DesktopTestResult;
  } catch {
    return undefined;
  }
}
