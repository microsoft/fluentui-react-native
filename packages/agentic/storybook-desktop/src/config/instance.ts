import { createHash } from 'node:crypto';
import fs from 'node:fs';

const defaultBundleIdentifierPrefix = 'com.microsoft.ReactTestApp';
const storybookPortBase = 17_000;
const metroPortBase = 27_000;
const portRange = 10_000;

export const FURN_STORYBOOK_INSTANCE_ID = 'FURN_STORYBOOK_INSTANCE_ID';
export const FURN_STORYBOOK_BUNDLE_IDENTIFIER = 'FURN_STORYBOOK_BUNDLE_IDENTIFIER';

export type DesktopStorybookInstanceOptions = {
  projectRoot: string;
  bundleIdentifierPrefix?: string;
};

export type DesktopStorybookInstance = Readonly<{
  id: string;
  projectRoot: string;
  bundleIdentifier: string;
  storybookPort: number;
  metroPort: number;
}>;

/**
 * Creates a stable identity for one physical Storybook enlistment.
 */
export function createDesktopStorybookInstance({
  projectRoot,
  bundleIdentifierPrefix = defaultBundleIdentifierPrefix,
}: DesktopStorybookInstanceOptions): DesktopStorybookInstance {
  validateBundleIdentifier(bundleIdentifierPrefix);

  const canonicalRoot = fs.realpathSync.native(projectRoot);
  const digest = createHash('sha256').update(canonicalRoot).digest('hex');
  const id = digest.slice(0, 10);
  const storybookOffset = Number.parseInt(digest.slice(10, 18), 16) % portRange;
  const metroOffset = Number.parseInt(digest.slice(18, 26), 16) % portRange;

  return Object.freeze({
    id,
    projectRoot: canonicalRoot,
    bundleIdentifier: `${bundleIdentifierPrefix}.i${id}`,
    storybookPort: storybookPortBase + storybookOffset,
    metroPort: metroPortBase + metroOffset,
  });
}

function validateBundleIdentifier(bundleIdentifier: string): void {
  if (!bundleIdentifier || !/^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(bundleIdentifier)) {
    throw new TypeError(`Invalid macOS bundle identifier prefix "${bundleIdentifier}".`);
  }
}
