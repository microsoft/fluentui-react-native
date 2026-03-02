import type { WorkerRunnerFunction } from 'lage';

import { $, fs } from 'zx';
import { join } from 'node:path';

export const run: WorkerRunnerFunction = async ({ target }) => {
  const pkg = await fs.readJson(join(target.cwd, 'package.json'));

  if (pkg.private) {
    return;
  }

  const dryRun = target.options?.dryRun ?? false;
  const args = ['--tolerate-republish', ...(dryRun ? ['--dry-run'] : [])];

  await $({ cwd: target.cwd, verbose: true })`yarn npm publish ${args}`;
};
