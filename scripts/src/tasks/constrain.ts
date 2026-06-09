import { PackageContext, type PackageManifest } from '../pkgContext.ts';
import { repoContext } from '../repoContext.ts';
import type { Yarn } from '@yarnpkg/types';

const repoCtx = repoContext();

export function constrain(workspace: Yarn.Constraints.Workspace): void {
  const ctx = PackageContext.initYarn(workspace);
  if (workspace.cwd !== 'scripts') {
    ctx.enforce('rnx-kit.extends', '@fluentui-react-native/scripts/kit-config');
  }
  if (ctx.manifest.scripts?.build) {
    ctx.enforce('scripts.build', 'tsgo');
  }
  ctx.enforce('scripts.build-cjs', undefined);
  ctx.enforce('scripts.build-core', undefined);
  assertDeprecations(ctx);
  useCatalogs(ctx);
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
