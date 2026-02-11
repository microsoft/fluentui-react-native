#!/usr/bin/env zx
import 'zx/globals';

/**
 * Post-version hook for dependency-profiles package
 *
 * This script runs after changesets version bump to update dependency-profiles
 * with the latest package versions and commit the changes.
 */

const DEPENDENCY_PROFILES_DIR = 'packages/dependency-profiles';

echo('🔍 Checking for dependency-profiles package...');

if (!fs.existsSync(DEPENDENCY_PROFILES_DIR)) {
  echo('⚠️  dependency-profiles directory not found, skipping');
} else {
  echo('📦 Updating dependency-profiles');
  cd(DEPENDENCY_PROFILES_DIR);
  await $`yarn update-profile`;

  echo('🔄 Updating yarn.lock');
  cd('../..');
  await $`yarn install --mode update-lockfile`;

  // Check if there are changes to commit
  const status = await $`git status --porcelain`;
  if (!status.stdout.trim()) {
    echo('✅ No changes to commit');
  } else {
    echo('💾 Committing dependency-profiles updates');

    await $`git config user.name "github-actions[bot]"`;
    await $`git config user.email "github-actions[bot]@users.noreply.github.com"`;
    await $`git add .`;
    await $`git commit -m "chore: update dependency-profiles and lockfile"`;
    await $`git push`;

    echo('✅ Committed dependency-profiles updates');
  }
}
