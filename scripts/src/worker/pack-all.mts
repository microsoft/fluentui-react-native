/**
 * Standalone script (replaces the lage worker) that runs `yarn pack` for each
 * public workspace, collecting tarballs into _packed/.
 *
 * Run from the repo root:
 *   node --experimental-strip-types scripts/src/worker/pack-all.mts
 */

import { $, fs } from 'zx';
import { join, resolve } from 'node:path';

const repoRoot = process.cwd();
const outputDir = resolve(repoRoot, '_packed');

await fs.mkdirp(outputDir);

const { stdout } = await $({ quiet: true })`yarn workspaces list --json`;
const workspaces: { location: string; name: string }[] = stdout
  .trim()
  .split('\n')
  .map((line: string) => JSON.parse(line));

await Promise.all(
  workspaces.map(async (ws) => {
    const wsDir = join(repoRoot, ws.location);
    const pkg = await fs.readJson(join(wsDir, 'package.json'));

    if (pkg.private) {
      return;
    }

    // Skip if this version is already published.
    const check = await $`npm view ${pkg.name}@${pkg.version} version`.nothrow().quiet();
    if (check.exitCode === 0) {
      console.log(`Skipping ${pkg.name}@${pkg.version} — already published`);
      return;
    }

    const safeName = (pkg.name as string).replace(/@/g, '').replace(/\//g, '-');
    const tgzFilename = `${safeName}-${pkg.version}.tgz`;
    const outPath = join(outputDir, tgzFilename);

    await $({ cwd: wsDir, verbose: true })`yarn pack --out ${outPath}`;
  }),
);
