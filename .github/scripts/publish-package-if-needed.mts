#!/usr/bin/env zx
import 'zx/globals';

// Type declaration for process (zx doesn't include Node.js types)
declare const process: {
  env: Record<string, string | undefined>;
  cwd: () => string;
  argv: string[];
  exit: (code: number) => never;
};

/**
 * Publish a single package to npm if needed
 *
 * This script:
 * - Operates on the current workspace directory
 * - Checks npm registry before publishing
 * - Skips private packages automatically
 *
 * Usage:
 *   # In a workspace directory:
 *   npx zx publish-package-if-needed.mts           # Publish for real
 *   npx zx publish-package-if-needed.mts --dry-run # Simulate publishing
 *
 *   # For all workspaces in topological order:
 *   yarn workspaces foreach --all --topological --no-private \
 *     exec npx zx .github/scripts/publish-package-if-needed.mts
 */

// Parse command line arguments
const isDryRun = process.argv.includes('--dry-run');

// Read package.json from current directory
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const { name, version, private: isPrivate } = packageJson;

// Skip private packages
if (isPrivate) {
  echo(`⊘ Skipping private package: ${name}`);
  process.exit(0);
}

// Check if package@version already exists on npm
const result = await $`npm view ${name}@${version} version 2>&1`.nothrow().quiet();
const shouldPublish = result.exitCode !== 0 || result.stdout.trim() !== version;

if (!shouldPublish) {
  echo(`✓ Already published: ${name}@${version}`);
  process.exit(0);
}

// Publish the package
const startMsg = isDryRun ? 'Simulating publish' : 'Publishing';
const endMsg = isDryRun ? 'Dry-run successful for' : 'Successfully published';

echo(`→ ${startMsg}: ${name}@${version}`);

const publishCmd = isDryRun
  ? $`yarn npm publish --access public --dry-run`
  : $`yarn npm publish --access public`;

await publishCmd;
echo(`✓ ${endMsg}: ${name}@${version}`);
