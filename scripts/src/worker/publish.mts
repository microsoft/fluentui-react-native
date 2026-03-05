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

  // If an outputDir is configured, look for a pre-packed tarball
  const tarball = outputDir ? await findTarball(pkg, outputDir) : undefined;

  if (tarball) {
    // yarn npm publish doesn't support tarballs, so use npm directly
    const args = ['publish', tarball, '--access', 'public', ...(dryRun ? ['--dry-run'] : [])];
    await $({ cwd: target.cwd, verbose: true })`npm ${args}`;
  } else {
    // No tarball found — publish from source (local dev / dry-run)
    const args = ['--tolerate-republish', ...(dryRun ? ['--dry-run'] : [])];
    await $({ cwd: target.cwd, verbose: true })`yarn npm publish ${args}`;
  }
};
