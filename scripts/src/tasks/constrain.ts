import { PackageContext, type PackageManifest } from '../pkgContext.ts';
import { repoContext } from '../repoContext.ts';
import type { Yarn } from '@yarnpkg/types';
import { referencesToPaths, pathsToReferences, areSetsEqual, type TsConfigJson, addSubBuildPaths } from '../utils/tsConfigs.ts';
import type { JSONValidator } from '@rnx-kit/lint-json';
import fs from 'node:fs';
import path from 'node:path';

const repoCtx = repoContext();

const targetTSConfigs = new Set<string>();

// TypeScript build information is a local cache. Yarn never packs node_modules and Git ignores it, so keeping the cache
// there prevents it from being committed or published.
const BUILD_INFO_DIR = 'node_modules/.cache';

/** The enforced build information path for a TypeScript config, relative to that config's directory. */
function buildInfoPath(configPath: string): string {
  const configDir = path.posix.dirname(configPath);
  const toRoot = configDir === '.' ? '' : `${path.posix.relative(configDir, '.')}/`;
  return `${toRoot}${BUILD_INFO_DIR}/${path.posix.basename(configPath, '.json')}.tsbuildinfo`;
}

/** Additional workspace TypeScript configs that can write build information: `tsconfig.*.json` and `targets/tsconfig*.json`. */
function auxiliaryTSConfigs(root: string): string[] {
  const list = (dir: string, pattern: RegExp) =>
    fs.existsSync(path.join(root, dir))
      ? fs
          .readdirSync(path.join(root, dir), { withFileTypes: true })
          .filter((entry) => entry.isFile() && pattern.test(entry.name))
          .map((entry) => (dir === '.' ? entry.name : `${dir}/${entry.name}`))
      : [];
  return [...list('.', /^tsconfig\..+\.json$/), ...list('targets', /^tsconfig.*\.json$/)];
}

function enforceBuildInfoLocation(ctx: PackageContext): void {
  for (const config of auxiliaryTSConfigs(ctx.root)) {
    const configCtx = ctx.validateJSON<TsConfigJson>(config);
    const options = configCtx?.raw.compilerOptions as Record<string, unknown> | undefined;
    if (configCtx && options && (options.tsBuildInfoFile !== undefined || options.composite === true || options.incremental === true)) {
      configCtx.enforce('compilerOptions.tsBuildInfoFile', buildInfoPath(config));
    }
    configCtx?.finish();
  }
}

export function constrain(workspace: Yarn.Constraints.Workspace): void {
  const ctx = PackageContext.initYarn(workspace);
  if (workspace.cwd !== 'scripts') {
    ctx.enforce('rnx-kit.extends', '@fluentui-react-native/scripts/kit-config');
  }
  if (ctx.manifest.scripts?.build) {
    ctx.enforce('scripts.build', 'tsc -b');
  }
  ctx.enforce('scripts.build-cjs', undefined);
  ctx.enforce('scripts.build-core', undefined);
  ctx.enforce('scripts.depcheck', undefined);
  const tsCtx = ctx.validateJSON<TsConfigJson>('tsconfig.json');
  if (tsCtx) {
    const depBuilds = new Set<string>();
    for (const [_, dependency] of workspace.pkg.dependencies) {
      if (dependency.workspace) {
        const targetPath = `${dependency.workspace.cwd}/tsconfig.json`;
        if (repoCtx.hasFile(targetPath)) {
          depBuilds.add(repoCtx.pathTo(workspace.cwd, targetPath));
        }
      }
    }
    addSubBuildPaths(ctx.root, depBuilds);
    if (depBuilds.size > 0) {
      ensureTSConfigReferences(tsCtx, depBuilds);
    } else {
      tsCtx.enforce('references', undefined);
    }
    targetTSConfigs.add(`${workspace.cwd}/tsconfig.json`);
    if (!tsCtx.raw.files || tsCtx.raw.files.length > 0) {
      tsCtx.enforce('compilerOptions.composite', true);
      tsCtx.enforce('compilerOptions.tsBuildInfoFile', buildInfoPath('tsconfig.json'));
    }
    tsCtx.finish();
  }
  enforceBuildInfoLocation(ctx);
  assertDeprecations(ctx);
  useCatalogs(ctx);
}

export function constrainRoot(workspace: Yarn.Constraints.Workspace): void {
  const ctx = PackageContext.initYarn(workspace);
  ctx.enforce('private', true);
  const rootTSConfig = ctx.validateJSON<TsConfigJson>('tsconfig.json');
  if (!rootTSConfig) {
    ctx.error('Root tsconfig.json is required to define project references for the workspaces');
    return;
  }
  ensureTSConfigReferences(rootTSConfig, targetTSConfigs);
  rootTSConfig.finish();
}

function ensureTSConfigReferences(ctx: JSONValidator<TsConfigJson>, expectedRefs: Set<string>): void {
  const existingSet = referencesToPaths(ctx.raw.references);
  if (!areSetsEqual(existingSet, expectedRefs)) {
    ctx.enforce('references', pathsToReferences(expectedRefs));
  }
}

function useCatalogs(ctx: PackageContext): void {
  const catalog = repoCtx.catalog;
  const deps: (keyof PackageManifest)[] = ['dependencies', 'devDependencies'];
  for (const dep of deps) {
    const depList = ctx.manifest[dep] as Record<string, string>;
    if (depList) {
      for (const pkg of Object.keys(depList)) {
        if (pkg in catalog) {
          ctx.enforce([dep as string, pkg], 'catalog:');
        }
      }
    }
  }
}

function assertDeprecations(ctx: PackageContext): void {
  // placeholder to add deprecated packages or parts of package.json to remove them
  ctx.enforce('scripts.lint-package', undefined);
}
