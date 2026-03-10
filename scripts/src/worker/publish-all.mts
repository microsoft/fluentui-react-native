/**
 * Standalone script (replaces the lage worker) that publishes pre-packed
 * tarballs from _packed/ to npm.
 *
 * Run from the repo root:
 *   node --experimental-strip-types scripts/src/worker/publish-all.mts [--dry-run]
 */

import { $, fs } from 'zx';
import { join, resolve } from 'node:path';

const dryRun = process.argv.includes('--dry-run');
const repoRoot = process.cwd();
const outputDir = resolve(repoRoot, '_packed');

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

    const safeName = (pkg.name as string).replace(/@/g, '').replace(/\//g, '-');
    const tgzFilename = `${safeName}-${pkg.version}.tgz`;
    const tgzPath = join(outputDir, tgzFilename);

    // Fallback: match by name prefix in case version format differs.
    let tarball: string | undefined;
    if (await fs.pathExists(tgzPath)) {
      tarball = tgzPath;
    } else if (await fs.pathExists(outputDir)) {
      const files = await fs.readdir(outputDir);
      const match = files.find((f: string) => f.startsWith(`${safeName}-`) && f.endsWith('.tgz'));
      if (match) tarball = join(outputDir, match);
    }

    if (!tarball) {
      // pack skipped this package (already published) — nothing to do.
      console.log(`Skipping ${pkg.name}@${pkg.version} — no tarball found`);
      return;
    }

    // yarn npm publish doesn't support tarballs, so use npm directly.
    const args = ['publish', tarball, '--access', 'public', ...(dryRun ? ['--dry-run'] : [])];
    await $({ cwd: wsDir, verbose: true })`npm ${args}`;
  }),
);
