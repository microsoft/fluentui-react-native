#!/usr/bin/env node
import { $, cd, echo, fs } from 'zx';

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

echo('📦 Running changeset version...');
await $`yarn changeset version`;

// Changesets doesn't bump or update the dependency-profiles package, so we need to do that manually
echo('\n🔄 Updating dependency-profiles...');
if (fs.existsSync(DEPENDENCY_PROFILES_DIR)) {
  const profileIndexPath = `${DEPENDENCY_PROFILES_DIR}/src/index.js`;
  const profileBefore = fs.readFileSync(profileIndexPath, 'utf-8');

  cd(DEPENDENCY_PROFILES_DIR);
  await $`yarn update-profile`;
  cd('../..');

  const profileAfter = fs.readFileSync(profileIndexPath, 'utf-8');
  if (profileAfter !== profileBefore) {
    const pkgPath = `${DEPENDENCY_PROFILES_DIR}/package.json`;
    const pkg = fs.readJsonSync(pkgPath);
    pkg.version = bumpPatch(pkg.version);
    fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });
    echo(`✅ dependency-profiles updated and bumped to ${pkg.version}`);
  } else {
    echo('✅ dependency-profiles updated (no version change needed)');
  }
} else {
  echo('⚠️  dependency-profiles not found, skipping');
}

echo('\n🔒 Updating yarn.lock...');
await $`yarn install --mode update-lockfile`;

echo('\n✅ Version bump complete!');
