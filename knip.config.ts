import type { KnipConfig } from 'knip';
import { repoContext } from './scripts/src/repoContext.ts';
import { PackageContext } from './scripts/src/pkgContext.ts';
import path from 'node:path';

const ignoredPaths = ['apps', 'scripts', 'packages/configs', 'packages/dependency-profiles'];

const config = async (): Promise<KnipConfig> => {
  const repoCtx = repoContext();
  // filter the workspace dirs to not include the ignored paths
  const workspaceDirs = repoCtx.workspaces.filter(
    (dir: string) => !ignoredPaths.some((ignored) => dir.startsWith(path.join(repoCtx.root, ignored))),
  );
  // now fill in the details for those
  const workspaceDetails = Object.fromEntries(
    workspaceDirs.map((dir: string) => {
      const relativePath = path.posix.normalize(path.relative(process.cwd(), dir));
      if (relativePath === '.') {
        // skip the root dir
        return [relativePath, {}];
      }
      const ctx = PackageContext.init(dir);
      const extraEntries = ctx.manifest.furn?.knip?.extraEntries;
      const knip = ctx.manifest.furn?.knip || {};
      const baseEntry = knip.entry ?? ['src/**/*.{ts,tsx}'];
      const entry = extraEntries ? [...baseEntry, ...extraEntries] : baseEntry;
      const baseProject = knip.project ?? ['src/**/*'];
      const project = knip.extraProject ? [...baseProject, ...knip.extraProject] : baseProject;

      const ignoreDependencies: string[] = knip.ignoreDependencies ?? [];

      return [
        relativePath,
        {
          entry,
          project,
          ignoreDependencies,
        },
      ];
    }),
  );

  const base: KnipConfig = {
    include: ['dependencies'],
    exclude: ['optionalPeerDependencies', 'devDependencies', 'unlisted'],
    ignore: ignoredPaths.map((path) => `${path}/**`),
    metro: false,
    workspaces: workspaceDetails,
  };

  return base;
};

export default config;
