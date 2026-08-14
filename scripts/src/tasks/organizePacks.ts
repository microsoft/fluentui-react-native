import { Command } from 'clipanion';
import fs from 'node:fs';
import path from 'node:path';
import { type PGraphNodeMap, PGraph } from 'p-graph';
import { type PackageInfos, findGitRoot, getPackageDependencies, getPackageInfos } from 'workspace-tools';

export class OrganizePacksCommand extends Command {
  static override paths = [['organize-packs']];

  static override usage = Command.Usage({
    description: 'Organize packages in _packed into the layer format needed for publishing',
  });

  async execute() {
    const gitRoot = findGitRoot(process.cwd());
    const packageInfos = getPackageInfos(gitRoot);
    const packRoot = path.join(gitRoot, '_packed');
    const packagesFile = path.join(packRoot, 'packages.txt');
    if (!fs.existsSync(packRoot)) {
      throw new Error(`_packed directory does not exist at ${packRoot}`);
    }
    if (!fs.existsSync(packagesFile)) {
      throw new Error(`Packages list does not exist at ${packagesFile}`);
    }

    const namesToPacks = Object.fromEntries(
      fs
        .readFileSync(packagesFile, 'utf-8')
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [name, tgz] = line.split(' ');
          return [name, path.join(packRoot, tgz)];
        }),
    );

    await movePacksToLayers({ packageInfos, packRoot, namesToPacks });

    return 0;
  }
}

async function movePacksToLayers(params: { packageInfos: PackageInfos; packRoot: string; namesToPacks: Record<string, string> }) {
  const { packageInfos, packRoot, namesToPacks } = params;

  const affectedPackages = Object.keys(namesToPacks);
  const affectedSet = new Set(affectedPackages);
  const nodeMap: PGraphNodeMap = new Map();
  const dependencies: [string, string][] = [];

  for (const pkg of affectedPackages) {
    nodeMap.set(pkg, {});
    dependencies.push(
      ...getPackageDependencies(packageInfos[pkg], affectedSet, {
        withDevDependencies: false,
        withPeerDependencies: true,
      }).map((depPkgName): [string, string] => [depPkgName, pkg]),
    );
  }

  // Slightly misuse the PGraph class for its dependency tree layer logic.
  const layers = new PGraph(nodeMap, dependencies).getLayers();
  const layersRoot = path.join(packRoot, 'layers');
  fs.mkdirSync(layersRoot, { recursive: true });

  for (const packageName of affectedPackages) {
    const packFilePath = namesToPacks[packageName];

    // Put the pack file in a subfolder for its dependency tree layer.
    // The prefix isn't strictly needed for single packages, but use it for consistency in case of a
    // monorepo which usually publishes multiple packages but sometimes only one has changed.
    const packageLayer = layers.findIndex((layer) => layer.includes(packageName));
    if (packageLayer === -1) {
      throw new Error(`Internal error: package ${packageName} not found in order of packages to publish`);
    }
    // Convert packageLayer from 0- to 1-indexed and pad with leading zeros based on the total
    const layerNum = String(packageLayer + 1).padStart(String(layers.length).length, '0');
    const layerDir = path.join(layersRoot, layerNum);
    fs.mkdirSync(layerDir, { recursive: true });
    const finalPackFilePath = path.join(layerDir, path.basename(packFilePath));
    fs.renameSync(packFilePath, finalPackFilePath);

    console.log(`Moved ${packageName} pack to ${finalPackFilePath}`);
  }
}
