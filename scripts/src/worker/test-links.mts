import type { WorkerRunnerFunction } from 'lage';

import { $, fs, glob } from 'zx';
import { dirname, join, relative, resolve } from 'node:path';

/**
 * Lage worker that runs `markdown-link-check` for a single package directory.
 *
 * Lage invokes this worker once per workspace package, so each invocation only
 * scans the markdown files that belong to that package. Because lage runs the
 * targets concurrently, the repo's markdown is link-checked directory by
 * directory in parallel instead of via a single serial `find | xargs` pass.
 *
 * Crucially, the walk stops descending at any nested workspace directory —
 * that package gets its own worker invocation. This is what keeps the root
 * package's invocation from recursing into `apps/*`, `packages/**`, and
 * `scripts`; the root only checks its own top-level markdown plus non-workspace
 * folders like `docs/`, `.github/`, and `.changeset/`.
 *
 * Note that the boundary is the set of *workspace* directories, not merely any
 * directory containing a `package.json`. Some folders (e.g. `docs/`, the
 * component template) carry a `package.json` but are not workspaces, so lage
 * never spawns a target for them — their markdown must be covered by the
 * nearest enclosing workspace (usually the root) rather than pruned away.
 */

const CONFIG_PATH = '.github/markdown-link-check-config.json';

// Directories that never contain checkable markdown and would only slow the walk.
const SKIP_DIRS = new Set(['node_modules', 'lib', 'lib-commonjs', 'dist', '.git']);

/**
 * Resolve the set of workspace directories from the root package.json's
 * `workspaces` globs, matching yarn's own resolution (a glob match that
 * contains a `package.json`). Cached per worker process since it never changes
 * across the targets a single worker handles.
 */
let workspaceDirsPromise: Promise<Set<string>> | undefined;
function getWorkspaceDirs(repoRoot: string): Promise<Set<string>> {
  workspaceDirsPromise ??= (async () => {
    const rootPkg = await fs.readJson(join(repoRoot, 'package.json'));
    const patterns: string[] = rootPkg.workspaces ?? [];
    const manifestGlobs = patterns.map((pattern) => (pattern === '.' ? 'package.json' : `${pattern}/package.json`));
    const manifests = await glob(manifestGlobs, { cwd: repoRoot, ignore: ['**/node_modules/**'] });
    return new Set(manifests.map((manifest) => resolve(repoRoot, dirname(manifest))));
  })();
  return workspaceDirsPromise;
}

/**
 * Collect markdown files under `startDir`, stopping at nested workspace
 * boundaries (each of which gets its own worker invocation). CHANGELOG.md is
 * excluded to match the repo's link-check convention.
 */
async function findMarkdownFiles(startDir: string, workspaceDirs: Set<string>): Promise<string[]> {
  const results: string[] = [];

  async function walk(current: string): Promise<void> {
    // Another workspace owns this subtree via its own worker invocation — don't
    // recurse into it. (The starting directory is never pruned.)
    if (current !== startDir && workspaceDirs.has(current)) {
      return;
    }

    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) {
          continue;
        }
        await walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'CHANGELOG.md') {
        results.push(full);
      }
    }
  }

  await walk(startDir);
  return results;
}

export const run: WorkerRunnerFunction = async ({ target }) => {
  // Lage runs from the repo root, so the config and binary resolve from here.
  const repoRoot = process.cwd();
  const configPath = resolve(repoRoot, CONFIG_PATH);

  const workspaceDirs = await getWorkspaceDirs(repoRoot);
  const files = await findMarkdownFiles(resolve(target.cwd), workspaceDirs);
  if (files.length === 0) {
    return;
  }

  const failures: string[] = [];
  for (const file of files) {
    const relPath = relative(repoRoot, file);
    const result = await $({ cwd: repoRoot, nothrow: true, verbose: true })`yarn markdown-link-check -c ${configPath} ${file}`;
    if (result.exitCode !== 0) {
      failures.push(relPath);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Dead links found in:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  }
};
