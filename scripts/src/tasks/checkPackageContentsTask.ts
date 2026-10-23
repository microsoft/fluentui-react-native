import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { Command } from 'clipanion';
import { findGitRoot } from 'workspace-tools';

const REGISTRY = 'references/agents/repository/package-guidance-packages.json';

type PackageManifest = {
  name?: string;
  main?: string;
  module?: string;
  types?: string;
  bin?: string | Record<string, string>;
  exports?: unknown;
};

function exportPaths(value: unknown): string[] {
  if (typeof value === 'string') return value.startsWith('./') ? [value.slice(2)] : [];
  if (Array.isArray(value)) return value.flatMap(exportPaths);
  if (typeof value === 'object' && value !== null) return Object.values(value).flatMap(exportPaths);
  return [];
}

function expectedEntrypoints(manifest: PackageManifest): string[] {
  const bin = typeof manifest.bin === 'string' ? [manifest.bin] : Object.values(manifest.bin ?? {});
  return [
    ...[manifest.main, manifest.module, manifest.types].filter((entry): entry is string => Boolean(entry)),
    ...bin,
    ...exportPaths(manifest.exports),
  ].map((entry) => entry.replace(/^\.\//, ''));
}

function listSourceFiles(root: string, packagePath: string): string[] {
  const output = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', packagePath], {
    cwd: root,
    encoding: 'utf8',
  });
  return output
    .split('\0')
    .filter(Boolean)
    .filter((file) => existsSync(path.join(root, file)))
    .map((file) => file.slice(packagePath.length + 1));
}

export class CheckPackageContentsCommand extends Command {
  static override paths = [['check-package-contents']];

  static override usage = Command.Usage({
    description: 'Verify the published contents of guided packages using Yarn pack inventories',
    details: 'Runs yarn pack --dry-run --json for each guided public package and verifies entry points and package guidance.',
    examples: [['Check package contents', '$0 check-package-contents']],
  });

  async execute() {
    const root = findGitRoot(process.cwd());
    const registryPath = path.join(root, REGISTRY);
    if (!existsSync(registryPath)) {
      console.error(`${REGISTRY}: missing guided package registry`);
      return 1;
    }

    const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as { packages?: unknown };
    if (!Array.isArray(registry.packages) || registry.packages.some((item) => typeof item !== 'string')) {
      console.error(`${REGISTRY}: packages must be an array of workspace paths`);
      return 1;
    }

    let failures = 0;
    for (const packagePath of registry.packages as string[]) {
      const packageRoot = path.join(root, packagePath);
      const manifest = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8')) as PackageManifest;
      if (!manifest.name) {
        console.error(`${packagePath}/package.json: package name is missing`);
        failures++;
        continue;
      }

      let locations: Set<string>;
      try {
        const output = execFileSync('yarn', ['pack', '--dry-run', '--json'], {
          cwd: packageRoot,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          maxBuffer: 64 * 1024 * 1024,
        });
        locations = new Set(
          output
            .split(/\r?\n/)
            .filter(Boolean)
            .map((line) => JSON.parse(line) as { location?: string })
            .map((entry) => entry.location)
            .filter((location): location is string => Boolean(location)),
        );
      } catch (error) {
        console.error(`${packagePath}: yarn pack --dry-run --json failed: ${String(error)}`);
        failures++;
        continue;
      }

      const required = [
        'AGENTS.md',
        'README.md',
        'references/README.md',
        ...expectedEntrypoints(manifest),
        ...listSourceFiles(root, packagePath).filter((file) => /^(?:references|src|lib|config|native)\//.test(file) || file === 'PLAN.md'),
      ];
      const missing = [...new Set(required)].filter((file) => !locations.has(file));
      const caches = [...locations].filter((file) => file === '.cache' || file.startsWith('.cache/'));
      if (missing.length || caches.length) {
        for (const file of missing) console.error(`${manifest.name}: required file is not packed: ${file}`);
        for (const file of caches) console.error(`${manifest.name}: generated cache must not be packed: ${file}`);
        failures++;
      } else {
        console.log(`${manifest.name}: package contents verified (${locations.size} files)`);
      }
    }

    if (failures) {
      console.error(`Package content check failed for ${failures} package(s).`);
      return 1;
    }
    console.log('Package content check passed.');
    return 0;
  }
}
