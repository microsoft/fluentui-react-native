#!/usr/bin/env node
/**
 * Post-version hook for dependency-profiles package
 *
 * This script runs after changesets version bump to update dependency-profiles
 * with the latest package versions and commit the changes.
 *
 * Usage: node scripts/update-dependency-profiles-postbump.mts
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const DEPENDENCY_PROFILES_DIR = 'packages/dependency-profiles';

function execCommand(command: string, cwd?: string): void {
  console.log(`> ${command}`);
  execSync(command, {
    stdio: 'inherit',
    cwd: cwd ? resolve(cwd) : undefined
  });
}

function hasGitChanges(): boolean {
  try {
    const output = execSync('git status --porcelain', { encoding: 'utf8' });
    return output.trim().length > 0;
  } catch (error) {
    console.error('Failed to check git status:', error);
    return false;
  }
}

function main(): void {
  console.log('🔍 Checking for dependency-profiles package...');

  if (!existsSync(DEPENDENCY_PROFILES_DIR)) {
    console.log('⚠️  dependency-profiles directory not found, skipping');
    return;
  }

  console.log('📦 Updating dependency-profiles');

  // Run update-profile script
  execCommand('yarn update-profile', DEPENDENCY_PROFILES_DIR);

  // Update lockfile at root
  console.log('🔄 Updating yarn.lock');
  execCommand('yarn install --mode update-lockfile');

  // Check if there are changes to commit
  if (!hasGitChanges()) {
    console.log('✅ No changes to commit');
    return;
  }

  console.log('💾 Committing dependency-profiles updates');

  // Configure git
  execCommand('git config user.name "github-actions[bot]"');
  execCommand('git config user.email "github-actions[bot]@users.noreply.github.com"');

  // Stage all changes
  execCommand('git add .');

  // Commit
  execCommand('git commit -m "chore: update dependency-profiles and lockfile"');

  // Push
  execCommand('git push');

  console.log('✅ Committed dependency-profiles updates');
}

main();
