import type { WorkerRunnerFunction } from 'lage';

import spawn from 'cross-spawn';
import { once } from 'node:events';
import fs from 'node:fs/promises';
import path from 'node:path';
import { type PGraphNodeMap, PGraph } from 'p-graph';
import { findGitRoot, getPackageDependencies, getPackageInfos } from 'workspace-tools';

import { yarnVerb } from '../utils/runScript.ts';

/**
 * Lage worker that runs `yarn pack` for each public package,
 * organizing the resulting .tgz files into dependency-ordered layers.
 *
 * The output directory is passed via `target.options.outputDir` in lage.config.js.
 * The tgz filename is derived from the package name and version so it is
 * unique and easy to correlate back to the package.
 */
export const run: WorkerRunnerFunction = async ({ target }) => {
  const pkg = JSON.parse(await fs.readFile(path.join(target.cwd, 'package.json'), 'utf8')) as {
    name: string;
    version: string;
    private?: boolean;
  };

  if (pkg.private) {
    return;
  }

  const outputDir = target.options?.outputDir as string | undefined;
  if (!outputDir) {
    throw new Error('pack worker requires options.outputDir to be set in lage.config.js');
  }

  // Resolve relative to cwd (lage runs from repo root, so this resolves correctly)
  const packRoot = path.resolve(outputDir);
  await fs.mkdir(packRoot, { recursive: true });

  // Skip if this version is already published
  const packageVersion = `${pkg.name}@${pkg.version}`;
  const lookup = spawn('npm', ['view', packageVersion, 'version'], { cwd: process.cwd(), stdio: 'ignore' });
  const result = await once(lookup, 'close').catch(() => undefined);
  if (result?.[0] === 0) {
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
  const layerDir = path.join(packRoot, layerNum);
  await fs.mkdir(layerDir, { recursive: true });

  // Build a safe filename: @fluentui-react-native/button@1.0.0 -> fluentui-react-native-button-1.0.0.tgz
  const safeName = pkg.name.replace(/@/g, '').replace(/\//g, '-');
  const tgzFilename = `${safeName}-${pkg.version}.tgz`;
  const outPath = path.join(layerDir, tgzFilename);

  const pack = spawn(yarnVerb, ['pack', '--out', outPath], { cwd: target.cwd, stdio: 'inherit' });
  const [code, signal] = await once(pack, 'close');
  if (code !== 0) {
    throw new Error(`yarn pack failed for ${packageVersion} (${code === null ? `signal ${signal}` : `exit ${code}`}).`);
  }
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
