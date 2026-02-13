#!/usr/bin/env zx
import 'zx/globals';

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

echo('📦 Running changeset version...');
await $`yarn changeset version`;

// Undo the commit that changeset version made, but keep the changes
// This allows the changesets action to create a single commit with all changes
echo('🔙 Undoing changeset commit (keeping changes)...');
await $`git reset --soft HEAD~1`;

echo('\n🔄 Updating dependency-profiles...');
if (fs.existsSync(DEPENDENCY_PROFILES_DIR)) {
  cd(DEPENDENCY_PROFILES_DIR);
  await $`yarn update-profile`;
  cd('../..');
  echo('✅ dependency-profiles updated');
} else {
  echo('⚠️  dependency-profiles not found, skipping');
}

echo('\n🔒 Updating yarn.lock...');
await $`yarn install --mode update-lockfile`;

echo('\n✅ Version bump complete!');
