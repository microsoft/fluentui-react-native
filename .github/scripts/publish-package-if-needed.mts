#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
}

/**
 * Publish a single package to npm if needed
 *
 * This script:
 * - Operates on the current workspace directory
 * - Checks npm registry before publishing (idempotent - safe to retry)
 * - Requires yarn npm authentication to be configured (npmAuthToken)
 * - Skips private packages automatically
 *
 * Usage:
 *   # In a workspace directory:
 *   node publish-package-if-needed.mts           # Publish for real
 *   node publish-package-if-needed.mts --dry-run # Simulate publishing
 *
 *   # For all workspaces in topological order:
 *   yarn workspaces foreach --all --topological --no-private \
 *     exec node .github/scripts/publish-package-if-needed.mts
 */

const isDryRun = process.argv.includes('--dry-run');

const packageJson: PackageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
const { name, version, private: isPrivate } = packageJson;

if (isPrivate) {
  console.log(`⊘ Skipping private package: ${name}`);
  process.exit(0);
}

// Check if package@version already exists on npm
const checkResult = spawnSync('npm', ['view', `${name}@${version}`, 'version'], {
  encoding: 'utf-8',
  stdio: 'pipe',
});
const alreadyPublished = checkResult.status === 0 && checkResult.stdout.trim() === version;

if (alreadyPublished) {
  console.log(`✓ Already published: ${name}@${version}`);
  process.exit(0);
}

const startMsg = isDryRun ? 'Simulating publish' : 'Publishing';
const endMsg = isDryRun ? 'Dry-run successful for' : 'Successfully published';

console.log(`→ ${startMsg}: ${name}@${version}`);

const publishArgs = ['npm', 'publish', '--access', 'public'];
if (isDryRun) publishArgs.push('--dry-run');

const publishResult = spawnSync('yarn', publishArgs, { stdio: 'inherit' });
if (publishResult.status !== 0) {
  process.exit(publishResult.status ?? 1);
}
console.log(`✓ ${endMsg}: ${name}@${version}`);
