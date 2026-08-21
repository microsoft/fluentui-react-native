import * as fs from 'node:fs';
import * as path from 'node:path';

import { PACKAGE_VERSION } from './package-version.ts';

describe('package version', () => {
  it('matches the manifest', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')) as { version: string };
    expect(PACKAGE_VERSION).toBe(manifest.version);
  });
});
