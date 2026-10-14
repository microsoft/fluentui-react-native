import { PackageContext, type PackageManifest } from '../pkgContext.ts';
import { repoContext } from '../repoContext.ts';
import type { Yarn } from '@yarnpkg/types';
import { referencesToPaths, pathsToReferences, areSetsEqual, type TsConfigJson, addSubBuildPaths } from '../utils/tsConfigs.ts';
import type { JSONValidator } from '@rnx-kit/lint-json';

const repoCtx = repoContext();

const targetTSConfigs = new Set<string>();

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
      tsCtx.enforce('compilerOptions.tsBuildInfoFile', '.cache/tsconfig.tsbuildinfo');
    }
    tsCtx.finish();
  }
  assertDeprecations(ctx);
  useCatalogs(ctx);
  ensureReactNativeExports(ctx);
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

/**
 * Metro resolves the "react-native" export condition to TypeScript source. Ensure published packages point that condition
 * at a file that exists, and that React Native libraries provide it for every export.
 */
function ensureReactNativeExports(ctx: PackageContext): void {
  const { exports, peerDependencies, private: isPrivate } = ctx.manifest;
  if (isPrivate || !exports || typeof exports !== 'object' || Array.isArray(exports)) {
    return;
  }
  const requireCondition = Boolean(peerDependencies?.['react-native']);
  for (const [subpath, conditions] of Object.entries(exports)) {
    if (!conditions || typeof conditions !== 'object' || Array.isArray(conditions)) {
      continue;
    }
    const target = (conditions as Record<string, unknown>)['react-native'];
    if (typeof target === 'string') {
      if (!repoCtx.hasFile(ctx.root, target)) {
        const swapped = target.endsWith('.tsx') ? target.slice(0, -1) : target.endsWith('.ts') ? `${target}x` : undefined;
        if (swapped && repoCtx.hasFile(ctx.root, swapped)) {
          ctx.enforce(['exports', subpath, 'react-native'], swapped);
        } else {
          ctx.error(`exports["${subpath}"]["react-native"] points to ${target}, which does not exist`);
        }
      }
    } else if (requireCondition) {
      ctx.error(`exports["${subpath}"] is missing a "react-native" condition pointing to its TypeScript source`);
    }
  }
}

function assertDeprecations(ctx: PackageContext): void {
  // placeholder to add deprecated packages or parts of package.json to remove them
  ctx.enforce('scripts.lint-package', undefined);
}
