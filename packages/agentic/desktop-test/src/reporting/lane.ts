import type { DesktopInputLaneReport, DesktopInputLaneSource } from './results.js';

/** Selects the input lane of a `test` run when `--input` is absent. */
export const desktopInputEnvironment = 'DESKTOP_INPUT';

export type DesktopInputLaneName = DesktopInputLaneReport['input'];

export type RequestedDesktopInputLane = { input: DesktopInputLaneName; source: Extract<DesktopInputLaneSource, 'option' | 'environment'> };

/** Validates a requested lane. `source` names where the value came from, so a bad one points at the right place. */
export function parseDesktopInputLane(value: string, source: string): DesktopInputLaneName {
  if (value !== 'accessible' && value !== 'physical') {
    throw Object.assign(new TypeError(`${source} must be accessible or physical.`), { code: 'config' });
  }
  return value;
}

/** The lane a command was asked for: `--input`, then `DESKTOP_INPUT`. An empty environment value is invalid, not unset. */
export function requestedDesktopInputLane(request: { flag?: string; environment?: string }): RequestedDesktopInputLane | undefined {
  if (request.flag !== undefined) return { input: parseDesktopInputLane(request.flag, '--input'), source: 'option' };
  if (request.environment !== undefined) {
    return { input: parseDesktopInputLane(request.environment, desktopInputEnvironment), source: 'environment' };
  }
  return undefined;
}

/**
 * How an accessible lane was masked. `host-masked` means this command started the host with keyboard, physical click and
 * wheel disabled. `verified-masked` means it attached to a host and checked the mask before running anything.
 */
export function createDesktopInputLane(
  input: DesktopInputLaneName,
  source: DesktopInputLaneSource,
  masking: 'host-masked' | 'verified-masked' = 'host-masked',
): DesktopInputLaneReport {
  return input === 'physical' ? { input, source, policyEnforced: false } : { input, source, masking, policyEnforced: false };
}
