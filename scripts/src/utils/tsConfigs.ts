import path from 'node:path';
import fs from 'node:fs';

export type TsConfigJson = {
  extends?: string | string[];
  compilerOptions?: Record<string, string | boolean | string[]>;
  include?: string[];
  exclude?: string[];
  files?: string[];
  references?: { path: string }[];
};

/**
 * Convert a tsconfig references array to a set of paths for easier manipulation
 * and validation of includes/excludes in the context of package validation
 */
export function referencesToPaths(refs: TsConfigJson['references']): Set<string> {
  const paths = new Set<string>();
  if (refs) {
    for (const ref of refs) {
      paths.add(ref.path);
    }
  }
  return paths;
}

/**
 * Convert a set of paths into an array of tsconfig references for writing back to a tsconfig file after validation and manipulation
 */
export function pathsToReferences(paths: Iterable<string>): TsConfigJson['references'] {
  const refs: TsConfigJson['references'] = [];
  for (const path of paths) {
    refs.push({ path });
  }
  return refs;
}

export function areSetsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) {
    return false;
  }
  for (const item of a) {
    if (!b.has(item)) {
      return false;
    }
  }
  return true;
}

const SUB_BUILD_PATH = 'targets';

export function addSubBuildPaths(cwd: string, targets: Set<string>): void {
  const subBuildPath = path.join(cwd, SUB_BUILD_PATH);
  if (fs.existsSync(subBuildPath) && fs.statSync(subBuildPath).isDirectory()) {
    const entries = fs.readdirSync(subBuildPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() && entry.name.startsWith('tsconfig')) {
        targets.add(`./${SUB_BUILD_PATH}/${entry.name}`);
      }
    }
  }
}
