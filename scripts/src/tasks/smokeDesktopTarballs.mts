import spawn from 'cross-spawn';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const names = ['desktop-driver', 'desktop-test', 'desktop-mcp', 'desktop-driver-mcp'].map((name) => `@fluentui-react-native/${name}`);

type PackageManifest = { name: string; version: string; exports?: object; bin?: string | Record<string, string> };
type PackedPackage = { filename: string; pkg: PackageManifest };
type PackageLock = { packages: Record<string, { version?: string; resolved?: string }> };

function run(command: string, args: string[], cwd: string, label: string, timeout = 60_000): string {
  const { NODE_OPTIONS: _nodeOptions, NODE_PATH: _nodePath, ...env } = process.env;
  const result = spawn.sync(command, args, { cwd, env, encoding: 'utf8', timeout });
  if (result.error || result.status !== 0) {
    throw new Error(`${label}: ${result.error?.message ?? (result.stderr.trim() || `exit ${result.status ?? result.signal}`)}`);
  }
  return result.stdout;
}

function packedPackages(directory: string): Map<string, PackedPackage> {
  const packages = new Map<string, PackedPackage>();
  for (const entry of fs.readdirSync(directory, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.tgz')) continue;
    const name = names.find((candidate) => {
      const prefix = `${candidate.slice(1).replace('/', '-')}-`;
      return entry.name.startsWith(prefix) && /^[0-9]/.test(entry.name.slice(prefix.length));
    });
    if (!name) continue;

    const filename = path.resolve(entry.parentPath, entry.name);
    const pkg = JSON.parse(run('tar', ['-xO', '-f', filename, 'package/package.json'], directory, `Read ${entry.name}`)) as PackageManifest;
    if (pkg.name !== name || entry.name !== `${name.slice(1).replace('/', '-')}-${pkg.version}.tgz` || packages.has(name)) {
      throw new Error(`Unexpected or duplicate desktop package: ${entry.name}`);
    }
    packages.set(name, { filename, pkg });
  }
  return packages;
}

// Keep this module's source fixed and resolve from the empty consumer, not from the monorepo.
const importCheck = `
  import { realpathSync } from 'node:fs';
  import { relative, isAbsolute, sep } from 'node:path';
  import { fileURLToPath } from 'node:url';
  const [specifier, directory] = process.argv.slice(1);
  const resolved = realpathSync(fileURLToPath(import.meta.resolve(specifier)));
  const file = relative(realpathSync(directory), resolved);
  if (isAbsolute(file) || file === '..' || file.startsWith('..' + sep)) {
    throw new Error('Export resolved outside its installed package: ' + specifier);
  }
  await import(specifier, resolved.endsWith('.json') ? { with: { type: 'json' } } : {});
`;

function verifyPackage(name: string, { filename, pkg }: PackedPackage, consumer: string, lock: PackageLock) {
  const key = `node_modules/${name}`;
  const entries = Object.entries(lock.packages).filter(([location]) => location === key || location.endsWith(`/${key}`));
  if (
    entries.length !== 1 ||
    entries[0][0] !== key ||
    entries[0][1].version !== pkg.version ||
    !entries[0][1].resolved?.startsWith('file:') ||
    path.resolve(consumer, entries[0][1].resolved.slice('file:'.length)) !== filename
  ) {
    throw new Error(`${name} must resolve to the packed ${pkg.version} tarball, without registry fallbacks.`);
  }

  const directory = path.join(consumer, key);
  const exports = Object.keys(pkg.exports ?? {}).filter((subpath) => subpath.startsWith('.'));
  for (const subpath of new Set(['.', ...exports])) {
    if (subpath.includes('*')) throw new Error(`${name} has a new export pattern; add explicit smoke coverage for it.`);
    const specifier = name + subpath.slice(1);
    run(process.execPath, ['--input-type=module', '--eval', importCheck, '--', specifier, directory], consumer, `Import ${specifier}`);
  }
  const bins = typeof pkg.bin === 'string' ? [pkg.bin] : Object.values(pkg.bin ?? {});
  for (const bin of bins) {
    const help = run(process.execPath, [path.join(directory, bin), '--help'], consumer, `${name} ${bin} --help`);
    if (!/\busage:/i.test(help)) throw new Error(`${name} ${bin} --help did not print usage.`);
  }
  console.log(`Verified ${name}@${pkg.version}: ${new Set(['.', ...exports]).size} imports, ${bins.length} CLI help checks.`);
}

const [directory = '_packed'] = process.argv.slice(2);
const packages = packedPackages(path.resolve(directory));
if (packages.size === 0) {
  console.log('No desktop tarballs to install; desktop smoke skipped.');
} else {
  const consumer = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-tarballs-'));
  try {
    fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({ private: true }));
    run(
      'npm',
      [
        'install',
        '--ignore-scripts',
        '--package-lock',
        '--no-audit',
        '--no-fund',
        ...[...packages.values()].map(({ filename }) => filename),
      ],
      consumer,
      'Install desktop tarballs',
      180_000,
    );
    const lock = JSON.parse(fs.readFileSync(path.join(consumer, 'package-lock.json'), 'utf8')) as PackageLock;
    for (const [name, pkg] of packages) verifyPackage(name, pkg, consumer, lock);
  } finally {
    fs.rmSync(consumer, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}
