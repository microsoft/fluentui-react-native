import type { WorkerRunnerFunction } from 'lage';

import { $, fs } from 'zx';
import { join, resolve } from 'node:path';
import { type PGraphNodeMap, PGraph } from 'p-graph';
import { findGitRoot, getPackageDependencies, getPackageInfos } from 'workspace-tools';

/**
 * Lage worker that runs `yarn npm pack` for each public package,
 * organizing the resulting .tgz files into dependency-ordered layers.
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

  // Resolve relative to cwd (lage runs from repo root, so this resolves correctly)
  const packRoot = resolve(outputDir);
  fs.mkdirpSync(packRoot);

  // Skip if this version is already published
  const result = await $`npm view ${pkg.name}@${pkg.version} version`.nothrow().quiet();
  if (result.exitCode === 0) {
    console.log(`Skipping ${pkg.name}@${pkg.version} — already published`);
    return;
  }

  // Output the tgz in the layout described at https://www.npmjs.com/package/@microsoft/esrp-npm-release#packed-packages-format
  // (this mirrors beachball's internal logic)
  const packageLayers = getLayers();
  const packageLayer = packageLayers.findIndex((layer) => layer.includes(pkg.name));
  if (packageLayer === -1) {
    throw new Error(`Internal error: package ${pkg.name} not found in order of packages to publish`);
  }

  // Convert packageLayer from 0- to 1-indexed and pad with leading zeros based on the total
  const layerNum = String(packageLayer + 1).padStart(String(packageLayers.length).length, '0');
  const layerDir = join(packRoot, layerNum);
  fs.mkdirpSync(layerDir);

  // Build a safe filename: @fluentui-react-native/button@1.0.0 -> fluentui-react-native-button-1.0.0.tgz
  const safeName = (pkg.name as string).replace(/@/g, '').replace(/\//g, '-');
  const tgzFilename = `${safeName}-${pkg.version}.tgz`;
  const outPath = join(layerDir, tgzFilename);

  await $({ cwd: target.cwd, verbose: true })`yarn pack --out ${outPath}`;
};

// This will be calculated once per worker
let layers: string[][] | undefined;

function getLayers() {
  if (layers) {
    return layers;
  }

  const packageInfos = getPackageInfos(findGitRoot(process.cwd()));
  const allPackages = new Set(Object.keys(packageInfos));
  const nodeMap: PGraphNodeMap = new Map();
  const dependencies: [string, string][] = [];

  // Calculate the dependency tree for all published packages, not just the packed ones.
  // (With beachball's bumping logic and usual options, it's safe to calculate the publish ordering
  // based on only the changed packages including dependent bumps. It's not clear whether this is
  // a safe assumption with changesets versioning logic.)
  for (const packageName of allPackages) {
    nodeMap.set(packageName, {});
    dependencies.push(
      ...getPackageDependencies(packageInfos[packageName], allPackages, {
        withDevDependencies: false,
        withPeerDependencies: true,
      }).map((dependencyName): [string, string] => [dependencyName, packageName]),
    );
  }

  // Slightly misuse the PGraph class for its dependency tree layer logic
  layers = new PGraph(nodeMap, dependencies).getLayers();
  return layers;
}
