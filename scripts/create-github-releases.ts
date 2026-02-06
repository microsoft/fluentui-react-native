#!/usr/bin/env node

/**
 * Creates GitHub releases for published packages with changelog extraction
 * Reads version changes from git and creates corresponding GitHub releases
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface PackageRelease {
  name: string;
  version: string;
  changelogPath: string;
  tag: string;
}

/**
 * Extract changelog section for a specific version
 */
function extractChangelogSection(changelogPath: string, version: string): string {
  if (!existsSync(changelogPath)) {
    return `Release ${version}`;
  }

  try {
    const content = readFileSync(changelogPath, 'utf8');
    // Match version section: ## version ... until next ## or end of file
    const versionEscaped = version.replace(/\./g, '\\.');
    const regex = new RegExp(`## ${versionEscaped}[\\s\\S]*?(?=\\n## |$)`, 'i');
    const match = content.match(regex);

    if (match) {
      // Clean up the section - remove the heading
      let section = match[0].trim();
      // Remove the ## version heading line
      section = section.replace(/^##\s+[\d.]+\s*\n/, '');
      return section.trim() || `Release ${version}`;
    }
  } catch (error) {
    console.error(`⚠️  Warning: Could not read changelog from ${changelogPath}`);
  }

  return `Release ${version}`;
}

/**
 * Get all packages that were published in the current commit
 * Looks for version changes in package.json files
 */
function getPublishedPackages(): PackageRelease[] {
  const releases: PackageRelease[] = [];

  try {
    // Get modified package.json files from the last commit
    const modifiedFiles = execSync('git diff --name-only HEAD~1 HEAD', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
      .split('\n')
      .filter(f => f.includes('package.json') && f !== 'package.json');

    for (const file of modifiedFiles) {
      if (!file) continue;

      try {
        // Get old and new package.json content
        const oldContent = execSync(`git show HEAD~1:${file}`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        const newContent = readFileSync(file, 'utf8');

        const oldPkg = JSON.parse(oldContent);
        const newPkg = JSON.parse(newContent);

        // Only include if version changed and package is public
        if (oldPkg.version !== newPkg.version && !newPkg.private) {
          const changelogPath = join(file, '..', 'CHANGELOG.md').replace(/\/package\.json\/\.\.\//, '/');
          const tag = `${newPkg.name}@${newPkg.version}`;

          releases.push({
            name: newPkg.name,
            version: newPkg.version,
            changelogPath,
            tag,
          });
        }
      } catch (error) {
        console.error(`⚠️  Warning: Could not process ${file}`);
      }
    }
  } catch (error) {
    console.error('⚠️  Warning: Could not get modified files');
    console.error((error as Error).message);
  }

  return releases;
}

/**
 * Check if a tag exists
 */
function tagExists(tag: string): boolean {
  try {
    execSync(`git rev-parse ${tag}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a git tag
 */
function createTag(tag: string, message: string): void {
  try {
    execSync(`git tag -a "${tag}" -m "${message}"`, { stdio: 'inherit' });
    console.log(`✅ Created tag: ${tag}`);
  } catch (error) {
    console.error(`❌ Failed to create tag: ${tag}`);
    throw error;
  }
}

/**
 * Push a tag to remote
 */
function pushTag(tag: string): void {
  try {
    execSync(`git push origin "${tag}"`, { stdio: 'inherit' });
    console.log(`✅ Pushed tag: ${tag}`);
  } catch (error) {
    console.error(`❌ Failed to push tag: ${tag}`);
    throw error;
  }
}

/**
 * Create a GitHub release
 */
function createGitHubRelease(release: PackageRelease, changelog: string): void {
  const { tag, name, version } = release;

  try {
    // Escape double quotes in changelog for shell command
    const escapedChangelog = changelog.replace(/"/g, '\\"');

    // Create GitHub release
    execSync(
      `gh release create "${tag}" --title "${name}@${version}" --notes "${escapedChangelog}"`,
      { stdio: 'inherit' }
    );
    console.log(`✅ Created GitHub release: ${tag}`);
  } catch (error) {
    console.error(`❌ Failed to create GitHub release: ${tag}`);
    throw error;
  }
}

/**
 * Check if a GitHub release exists
 */
function releaseExists(tag: string): boolean {
  try {
    execSync(`gh release view "${tag}"`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Main function
 */
function main(): void {
  console.log('🚀 Creating GitHub releases for published packages...\n');

  // Get all published packages from the last commit
  const releases = getPublishedPackages();

  if (releases.length === 0) {
    console.log('ℹ️  No package releases found in the last commit');
    console.log('This is expected if no packages were published.');
    process.exit(0);
  }

  console.log(`📦 Found ${releases.length} package(s) to create releases for:\n`);
  releases.forEach(r => console.log(`  - ${r.name}@${r.version}`));
  console.log('');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const release of releases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${release.name}@${release.version}`);
    console.log('='.repeat(60));

    try {
      // Check if release already exists
      if (releaseExists(release.tag)) {
        console.log(`⏭️  GitHub release already exists: ${release.tag}`);
        skipCount++;
        continue;
      }

      // Extract changelog
      const changelog = extractChangelogSection(release.changelogPath, release.version);
      console.log(`📝 Extracted changelog (${changelog.length} chars)`);

      // Create tag if it doesn't exist
      if (!tagExists(release.tag)) {
        console.log(`📌 Creating tag: ${release.tag}`);
        createTag(release.tag, `Release ${release.name}@${release.version}`);
        pushTag(release.tag);
      } else {
        console.log(`✅ Tag already exists: ${release.tag}`);
      }

      // Create GitHub release
      console.log(`🚀 Creating GitHub release...`);
      createGitHubRelease(release, changelog);

      successCount++;
    } catch (error) {
      console.error(`❌ Error processing ${release.name}@${release.version}:`);
      console.error((error as Error).message);
      errorCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  ✅ Releases created: ${successCount}`);
  console.log(`  ⏭️  Releases skipped (already exist): ${skipCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));

  if (errorCount > 0) {
    console.log('\n⚠️  Some releases failed to create. Check the logs above.');
    process.exit(1);
  }

  console.log('\n✅ All releases created successfully!');
  process.exit(0);
}

main();
