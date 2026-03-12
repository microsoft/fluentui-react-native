/**
 * Auto-generates subpath exports for the fluentui-react-native mono-package.
 *
 * All generated files live in src/ (checked into git):
 *   src/components.ts   — category barrel re-exporting all stable component packages
 *   src/experimental.ts — category barrel re-exporting all experimental packages
 *   src/core.ts         — category barrel re-exporting framework packages
 *   src/theming.ts      — category barrel re-exporting theme packages
 *   src/utils.ts        — category barrel re-exporting utility packages
 *   src/deprecated.ts   — category barrel re-exporting legacy @uifabricshared packages
 *   src/<subpath>.ts    — individual re-export for each package (e.g. src/button.ts)
 *
 * Usage:
 *   node update-exports.mts          # Generate/update src/ and package.json
 *   node update-exports.mts --check  # Verify src/ and package.json are up-to-date (CI mode)
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { parseArgs } from 'node:util';
import { getAllPackageJsonFiles } from 'workspace-tools';

const SCRIPT_DIR = import.meta.dirname;
const REPO_ROOT = join(SCRIPT_DIR, '..', '..', '..');
const SRC_DIR = join(SCRIPT_DIR, 'src');
const PKG_JSON_PATH = join(SCRIPT_DIR, 'package.json');

/** Category definitions — maps a directory prefix to a category barrel name. */
const CATEGORIES: { prefix: string; barrel: string }[] = [
  { prefix: 'packages/components/', barrel: 'components' },
  { prefix: 'packages/experimental/', barrel: 'experimental' },
  { prefix: 'packages/framework/', barrel: 'core' },
  { prefix: 'packages/framework-base/', barrel: 'core' },
  { prefix: 'packages/theming/', barrel: 'theming' },
  { prefix: 'packages/utils/', barrel: 'utils' },
  { prefix: 'packages/deprecated/', barrel: 'deprecated' },
];

/** Packages to always exclude (by npm package name). */
const EXCLUDE_PACKAGES = new Set([
  'fluentui-react-native', // ourselves
  '@fluentui/react-native', // the existing barrel package
  '@fluentui-react-native/dependency-profiles', // meta-package for version alignment
  '@fluentui-react-native/codemods', // codemod tooling
]);

interface PackageManifest {
  name: string;
  version: string;
  private?: boolean;
}

interface SubpathEntry {
  subpath: string;
  packageName: string;
  category: string;
}

function deriveSubpath(packageName: string): string {
  const parts = packageName.split('/');
  return parts[parts.length - 1];
}

/** Discover all publishable packages that should be re-exported. */
function discoverPackages(): SubpathEntry[] {
  const entries: SubpathEntry[] = [];
  const seenSubpaths = new Map<string, string>();

  for (const manifestPath of getAllPackageJsonFiles(PKG_JSON_PATH)?.sort() ?? []) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as PackageManifest;

    if (manifest.private) continue;
    if (!manifest.name || !manifest.version) continue;
    if (EXCLUDE_PACKAGES.has(manifest.name)) continue;

    const relPath = relative(REPO_ROOT, dirname(manifestPath)).replace(/\\/g, '/');
    const relPathSlash = relPath + '/';
    const matchedCategory = CATEGORIES.find((cat) => relPathSlash.startsWith(cat.prefix));
    if (!matchedCategory) continue;

    const subpath = deriveSubpath(manifest.name);

    if (seenSubpaths.has(subpath)) {
      throw new Error(`Subpath collision: "${subpath}" is mapped by both "${seenSubpaths.get(subpath)}" and "${manifest.name}"`);
    }
    seenSubpaths.set(subpath, manifest.name);

    entries.push({ subpath, packageName: manifest.name, category: matchedCategory.barrel });
  }

  const barrelNames = new Set(CATEGORIES.map((c) => c.barrel));
  for (const entry of entries) {
    if (barrelNames.has(entry.subpath)) {
      throw new Error(`Subpath "${entry.subpath}" (from ${entry.packageName}) collides with category barrel name "${entry.subpath}"`);
    }
  }

  return entries.sort((a, b) => a.subpath.localeCompare(b.subpath));
}

/** Group entries by category barrel name. */
function groupByCategory(entries: SubpathEntry[]): Map<string, SubpathEntry[]> {
  const barrels = new Map<string, SubpathEntry[]>();
  for (const entry of entries) {
    const group = barrels.get(entry.category) ?? [];
    group.push(entry);
    barrels.set(entry.category, group);
  }
  return barrels;
}

// ── Expected state builders ────────────────────────────────────────────────────

/** Build all expected src/ files (category barrels + individual subpath re-exports). */
function generateSrcFiles(entries: SubpathEntry[], barrels: Map<string, SubpathEntry[]>): Map<string, string> {
  const files = new Map<string, string>();

  // Category barrels — @ts-nocheck because aggregating overlapping packages causes TS2308
  for (const [barrelName, barrelEntries] of [...barrels].sort(([a], [b]) => a.localeCompare(b))) {
    const lines = barrelEntries.map((e) => `export * from '${e.packageName}';`);
    const header =
      '// @ts-nocheck — Category barrels re-export overlapping packages that share symbols, causing TS2308 duplicate export errors.\n';
    files.set(`${barrelName}.ts`, header + lines.join('\n') + '\n');
  }

  // Individual subpath files
  for (const { subpath, packageName } of entries) {
    files.set(`${subpath}.ts`, `export * from '${packageName}';\n`);
  }

  return files;
}

/** Build the package.json "exports" map — all subpaths point to src/. */
function generateExports(entries: SubpathEntry[], barrels: Map<string, SubpathEntry[]>): Record<string, Record<string, string>> {
  const exports: Record<string, Record<string, string>> = {};

  // Category barrels
  for (const barrel of [...barrels.keys()].sort()) {
    exports[`./${barrel}`] = {
      default: `./src/${barrel}.ts`,
    };
  }

  // Individual subpaths
  for (const { subpath } of entries) {
    exports[`./${subpath}`] = {
      default: `./src/${subpath}.ts`,
    };
  }
  return exports;
}

/** Build the package.json "dependencies" map (sorted by package name for oxfmt compatibility). */
function generateDependencies(entries: SubpathEntry[]): Record<string, string> {
  const deps: Record<string, string> = {};
  const sorted = [...entries].sort((a, b) => a.packageName.localeCompare(b.packageName));
  for (const { packageName } of sorted) {
    deps[packageName] = 'workspace:*';
  }
  return deps;
}

// ── Main ───────────────────────────────────────────────────────────────────────

const { values: args } = parseArgs({ options: { check: { type: 'boolean', default: false } } });
const isCheck = args.check;

const entries = discoverPackages();
const barrels = groupByCategory(entries);
console.log(`Found ${entries.length} packages in ${barrels.size} categories`);

const expectedSrcFiles = generateSrcFiles(entries, barrels);
const expectedExports = generateExports(entries, barrels);
const expectedDeps = generateDependencies(entries);

// Read current state
const pkgJson = JSON.parse(readFileSync(PKG_JSON_PATH, 'utf-8'));
const currentExports = pkgJson.exports || {};
const currentDeps = pkgJson.dependencies || {};

const diffs: string[] = [];

// Check src/ files (the checked-in source of truth)
for (const [relPath, expectedContent] of expectedSrcFiles) {
  const fullPath = join(SRC_DIR, relPath);
  const currentContent = existsSync(fullPath) ? readFileSync(fullPath, 'utf-8') : null;
  if (currentContent !== expectedContent) {
    diffs.push(`src/${relPath} ${currentContent === null ? 'missing' : 'differs'}`);
  }
}

// Check for stale files in src/
if (existsSync(SRC_DIR)) {
  for (const entry of readdirSync(SRC_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      diffs.push(`src/${entry.name}/ is stale (unexpected directory)`);
    } else if (entry.isFile() && !expectedSrcFiles.has(entry.name)) {
      diffs.push(`src/${entry.name} is stale (no matching category)`);
    }
  }
}

// Check exports field
if (JSON.stringify(currentExports) !== JSON.stringify(expectedExports)) {
  diffs.push('package.json "exports" field differs from expected');
}

// Check dependencies field
if (JSON.stringify(currentDeps) !== JSON.stringify(expectedDeps)) {
  diffs.push('package.json "dependencies" field differs from expected');
}

if (isCheck) {
  if (diffs.length > 0) {
    console.error('\nOut-of-sync items:');
    for (const diff of diffs) {
      console.error(`  ✗ ${diff}`);
    }
    console.error('\n❌ Exports are out of sync. Run `yarn update-exports` to fix.');
    process.exit(1);
  } else {
    console.log('✅ Exports are up to date.');
    process.exit(0);
  }
}

// ── Write mode ─────────────────────────────────────────────────────────────────

// Ensure src/ exists
if (!existsSync(SRC_DIR)) {
  mkdirSync(SRC_DIR, { recursive: true });
}

// Write src/ files (category barrels + individual subpaths)
for (const [relPath, content] of expectedSrcFiles) {
  writeFileSync(join(SRC_DIR, relPath), content);
}

// Clean stale src/ files
for (const entry of readdirSync(SRC_DIR, { withFileTypes: true })) {
  if (entry.isDirectory()) {
    rmSync(join(SRC_DIR, entry.name), { recursive: true });
  } else if (entry.isFile() && !expectedSrcFiles.has(entry.name)) {
    rmSync(join(SRC_DIR, entry.name));
    console.log(`  Removed stale: src/${entry.name}`);
  }
}

// Update package.json
pkgJson.exports = expectedExports;
pkgJson.dependencies = expectedDeps;
writeFileSync(PKG_JSON_PATH, JSON.stringify(pkgJson, null, 2) + '\n');

// Print summary
const numSubpaths = entries.length + barrels.size;
console.log(`\n✅ Generated ${numSubpaths} src/ files (${barrels.size} barrels + ${entries.length} individual)\n`);
for (const [barrelName, barrelEntries] of [...barrels].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`  ./${barrelName} (${barrelEntries.length} packages)`);
}
