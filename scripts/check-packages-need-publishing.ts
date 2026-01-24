#!/usr/bin/env node

/**
 * Check which packages need publishing to NPM
 *
 * Scans all packages in the monorepo and checks if their current versions
 * exist on NPM. Fails if no packages need publishing (all versions already exist).
 *
 * Exit codes:
 *   0 - Success, packages need publishing
 *   1 - Error, no packages need publishing or script failed
 */

import { execSync, type ExecException } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
}

/**
 * Check if a specific package version exists on NPM
 */
function checkPackageOnNpm(packageName: string, version: string): boolean {
  try {
    execSync(`npm view ${packageName}@${version} version`, {
      stdio: 'pipe',
      encoding: 'utf8',
    });
    return true; // Package exists on NPM
  } catch (error) {
    // npm view exits with code 1 when package doesn't exist (404)
    // Check if this is a "not found" error vs a real error (network, etc)
    const execError = error as ExecException;
    const stderr = execError.stderr?.toString() || '';
    if (stderr.includes('404') || stderr.includes('Not Found')) {
      return false; // Package doesn't exist on NPM
    }
    // For other errors (network issues, npm down, etc), throw so we don't incorrectly
    // report that packages need publishing when we can't actually check NPM
    throw error;
  }
}

/**
 * Get all workspace packages using yarn workspaces list
 */
function getWorkspacePackages(): string[] {
  try {
    const output = execSync('yarn workspaces list --json', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const workspaces: string[] = [];
    // Each line is a JSON object
    for (const line of output.trim().split('\n')) {
      const workspace = JSON.parse(line);
      // Skip the root workspace (location is '.')
      if (workspace.location && workspace.location !== '.') {
        workspaces.push(join(process.cwd(), workspace.location, 'package.json'));
      }
    }

    return workspaces;
  } catch (error) {
    console.error('❌ ERROR: Failed to get yarn workspaces');
    console.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Main function that checks all packages in the monorepo
 */
function main(dryRun = false): void {
  console.log('🔍 Checking which packages need publishing...\n');

  const packagesToPublish: string[] = [];
  const packagesAlreadyPublished: string[] = [];
  const packagesSkipped: string[] = [];

  const packageJsonPaths = getWorkspacePackages();

  for (const packageJsonPath of packageJsonPaths) {

    let packageJson: PackageJson;
    try {
      const content = readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(content);
    } catch (error) {
      console.error(`⚠️  Failed to read ${packageJsonPath}:`, (error as Error).message);
      continue;
    }

    const { name, version, private: isPrivate } = packageJson;

    if (!name || !version) {
      console.log(`⏭️  Skipping ${packageJsonPath}: missing name or version`);
      packagesSkipped.push(packageJsonPath);
      continue;
    }

    if (isPrivate) {
      console.log(`⏭️  Skipping private package: ${name}@${version}`);
      packagesSkipped.push(`${name}@${version}`);
      continue;
    }

    const existsOnNpm = checkPackageOnNpm(name, version);

    if (existsOnNpm) {
      console.log(`✅ Already published: ${name}@${version}`);
      packagesAlreadyPublished.push(`${name}@${version}`);
    } else {
      console.log(`📦 Will publish: ${name}@${version}`);
      packagesToPublish.push(`${name}@${version}`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  Packages to publish: ${packagesToPublish.length}`);
  console.log(`  Already on NPM: ${packagesAlreadyPublished.length}`);
  console.log(`  Skipped: ${packagesSkipped.length}`);
  console.log('='.repeat(60));

  // Print packages to publish if any
  if (dryRun && packagesToPublish.length > 0) {
    console.log('\nPackages that will be published:');
    packagesToPublish.forEach(pkg => console.log(`  - ${pkg}`));
  }

  // Fail if nothing to publish (unless dry-run)
  if (packagesToPublish.length === 0) {
    if (dryRun) {
      console.log('\n✅ Dry-run: No packages would be published');
      console.log('All package versions already exist on NPM.');
      process.exit(0);
    } else {
      console.log('\n❌ ERROR: No packages need publishing!');
      console.log('All package versions already exist on NPM.\n');
      console.log('This likely means:');
      console.log('  1. The version bump PR was merged without actually bumping versions');
      console.log('  2. Packages were already published manually');
      console.log('  3. The version bump workflow didn\'t run correctly');
      process.exit(1);
    }
  }

  if (dryRun) {
    console.log(`\n✅ Dry-run: ${packagesToPublish.length} package(s) would be published`);
  } else {
    console.log(`\n✅ Ready to publish ${packagesToPublish.length} package(s)`);
  }
  process.exit(0);
}

// Parse CLI args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

main(dryRun);
