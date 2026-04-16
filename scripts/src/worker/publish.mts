import type { WorkerRunnerFunction } from 'lage';

import { $, fs } from 'zx';
import { join, resolve } from 'node:path';

/**
 * Find the tarball for a package in the output directory.
 * Returns the full path if found, undefined otherwise.
 */
async function findTarball(pkg: { name: string; version: string }, outputDir: string): Promise<string | undefined> {
  const stagingDir = resolve(outputDir);
  const safeName = (pkg.name as string).replace(/@/g, '').replace(/\//g, '-');
  const tgzFilename = `${safeName}-${pkg.version}.tgz`;
  const tgzPath = join(stagingDir, tgzFilename);

  if (await fs.pathExists(tgzPath)) {
    return tgzPath;
  }

  // Fallback: match by package name prefix in case version format differs
  if (await fs.pathExists(stagingDir)) {
    const files = await fs.readdir(stagingDir);
    const match = files.find((f: string) => f.startsWith(`${safeName}-`) && f.endsWith('.tgz'));
    if (match) {
      return join(stagingDir, match);
    }
  }

  return undefined;
}

export const run: WorkerRunnerFunction = async ({ target }) => {
  const pkg = await fs.readJson(join(target.cwd, 'package.json'));

  if (pkg.private) {
    return;
  }

  const dryRun = target.options?.dryRun ?? false;
  const outputDir = target.options?.outputDir as string | undefined;
  const tarball = outputDir ? await findTarball(pkg, outputDir) : undefined;

  if (!tarball) {
    // No tarball means pack skipped this package (already published) — nothing to do
    console.log(`Skipping ${pkg.name}@${pkg.version} — no tarball found`);
    return;
  }

  // yarn npm publish doesn't support tarballs, so use npm directly
  const args = ['publish', tarball, '--access', 'public', ...(dryRun ? ['--dry-run'] : [])];
  await $({ cwd: target.cwd, verbose: true })`npm ${args}`;
};
