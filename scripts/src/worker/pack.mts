import type { WorkerRunnerFunction } from 'lage';

import { $, fs } from 'zx';
import { join, resolve } from 'node:path';

/**
 * Lage worker that runs `yarn npm pack` for each public package,
 * collecting the resulting .tgz files into a flat staging directory.
 *
 * The output directory is passed via `target.options.outputDir` in lage.config.js.
 * The tgz filename is derived from the package name and version so it is
 * unique and easy to correlate back to the package.
 */
export const run: WorkerRunnerFunction = async ({ target }) => {
  const pkg = await fs.readJson(join(target.cwd, 'package.json'));

  if (pkg.private) {
    return;
  }

  const outputDir = target.options?.outputDir as string | undefined;
  if (!outputDir) {
    throw new Error('pack worker requires options.outputDir to be set in lage.config.js');
  }

  // Skip if this version is already published
  const result = await $`npm view ${pkg.name}@${pkg.version} version`.nothrow().quiet();
  if (result.exitCode === 0) {
    console.log(`Skipping ${pkg.name}@${pkg.version} — already published`);
    return;
  }

  // Resolve relative to cwd (lage runs from repo root, so this resolves correctly)
  const stagingDir = resolve(outputDir);
  await fs.mkdirp(stagingDir);

  // Build a safe filename: @fluentui-react-native/button@1.0.0 -> fluentui-react-native-button-1.0.0.tgz
  const safeName = (pkg.name as string).replace(/@/g, '').replace(/\//g, '-');
  const tgzFilename = `${safeName}-${pkg.version}.tgz`;
  const outPath = join(stagingDir, tgzFilename);

  await $({ cwd: target.cwd, verbose: true })`yarn pack --out ${outPath}`;
};
