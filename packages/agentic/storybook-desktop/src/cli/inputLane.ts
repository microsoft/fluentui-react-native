import fs from 'node:fs';

import type { DesktopInputLane } from '@fluentui-react-native/desktop-driver/authoring';
import { createDesktopInputLane, requestedDesktopInputLane } from '@fluentui-react-native/desktop-test/reporting';
import type { DesktopInputLaneReport } from '@fluentui-react-native/desktop-test/reporting';

import type { Platforms } from '../config/platforms.js';
import { desktopStorybookDriverManifestPath, driverManifestInput } from '../driver/driverManifest.js';

export type CommandInputLaneRequest = {
  command: 'test' | 'smoke';
  /** `smoke` runs authored tests only in its stories-and-tests mode; a run without tests has no lane to account for. */
  runsTests: boolean;
  flag?: string;
  environment?: string;
  /** The lane the attached driver instance was started for. Only `test` attaches to one, and only without `--url`. */
  driverInput?: () => DesktopInputLane | undefined;
};

/**
 * The lane a `test` or `smoke` run holds its tests to, and where it came from: `--input`, then `DESKTOP_INPUT`, then
 * the driver instance `test` attaches to. No lane is compatibility mode, which keeps the behavior from before lanes.
 * An accessible lane's masking depends on who owns the driver: `smoke` starts it masked, while `test` attaches to one
 * and verifies the mask before it runs anything.
 */
export function resolveCommandInputLane(request: CommandInputLaneRequest): DesktopInputLaneReport | undefined {
  if (!request.runsTests) return undefined;
  const masking = request.command === 'smoke' ? 'host-masked' : 'verified-masked';
  const requested = requestedDesktopInputLane({ flag: request.flag, environment: request.environment });
  if (requested) return createDesktopInputLane(requested.input, requested.source, masking);
  const input = request.driverInput?.();
  return input ? createDesktopInputLane(input, 'driver', masking) : undefined;
}

/** The lane the running driver instance for an endpoint declares. A missing or unreadable manifest declares none. */
export function readDriverInstanceInput(projectRoot: string, platform: Platforms): DesktopInputLane | undefined {
  try {
    return driverManifestInput(JSON.parse(fs.readFileSync(desktopStorybookDriverManifestPath(projectRoot, platform), 'utf8')));
  } catch {
    return undefined;
  }
}
