// @ts-check

import { $, fs } from 'zx';
import { join } from 'node:path';

/**
 * @param {{ target: { cwd: string; label: string }, options: { dryRun?: boolean } }} data
 */
export async function run({ target, options }) {
  const pkg = await fs.readJson(join(target.cwd, 'package.json'));

  if (pkg.private) {
    return;
  }

  const dryRun = options?.dryRun ?? false;
  const args = ['--tolerate-republish', ...(dryRun ? ['--dry-run'] : [])];

  await $({ cwd: target.cwd, verbose: true })`yarn npm publish ${args}`;
}
