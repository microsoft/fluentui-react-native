#!/usr/bin/env node
import fs from 'node:fs';

import { runYarn } from '../../scripts/src/utils/runScript.ts';

/**
 * Changeset version bump with post-bump hook
 *
 * This script orchestrates the version bump process:
 * 1. Runs changeset version to bump package versions
 * 2. Updates dependency-profiles with new versions
 * 3. Updates yarn.lock to reflect all changes
 *
 * The changesets action will automatically commit these changes.
 */

const DEPENDENCY_PROFILES_DIR = 'packages/dependency-profiles';

function bumpPatch(version: string): string {
  const [major, minor, patch] = version.split('.').map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

async function runStep(command: string, ...args: string[]): Promise<void> {
  const code = await runYarn(command, ...args);
  if (code !== 0) {
    console.error(`yarn ${[command, ...args].join(' ')} failed (exit ${code}).`);
    process.exit(code > 0 ? code : 1);
  }
}

console.log('📦 Running changeset version...');
await runStep('changeset', 'version');

// Changesets doesn't bump or update the dependency-profiles package, so we need to do that manually
console.log('\n🔄 Updating dependency-profiles...');
if (fs.existsSync(DEPENDENCY_PROFILES_DIR)) {
  const profileIndexPath = `${DEPENDENCY_PROFILES_DIR}/src/index.js`;
  const profileBefore = fs.readFileSync(profileIndexPath, 'utf-8');

  await runStep('workspace', '@fluentui-react-native/dependency-profiles', 'update-profile');

  const profileAfter = fs.readFileSync(profileIndexPath, 'utf-8');
  if (profileAfter !== profileBefore) {
    const pkgPath = `${DEPENDENCY_PROFILES_DIR}/package.json`;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { version: string };
    pkg.version = bumpPatch(pkg.version);
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log(`✅ dependency-profiles updated and bumped to ${pkg.version}`);
  } else {
    console.log('✅ dependency-profiles updated (no version change needed)');
  }
} else {
  console.log('⚠️  dependency-profiles not found, skipping');
}

console.log('\n🔒 Updating yarn.lock...');
await runStep('install', '--mode', 'update-lockfile');

console.log('\n✅ Version bump complete!');
