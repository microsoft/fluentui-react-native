#!/usr/bin/env node
/**
 * Validate changesets in CI
 *
 * Checks:
 * 1. Changesets are present (PRs require changesets)
 * 2. No major version bumps (breaking changes disallowed)
 * 3. Changeset status passes (validates format, config, dependencies)
 *
 * Usage: node .github/scripts/validate-changesets.mts
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const CHANGESETS_DIR = '.changeset';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

interface ChangesetFrontmatter {
  [packageName: string]: 'major' | 'minor' | 'patch';
}

function parseChangesetForMajorCheck(filePath: string): ChangesetFrontmatter | null {
  try {
    const content = readFileSync(filePath, 'utf-8');

    // Extract frontmatter between --- markers
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return null;
    }

    const frontmatter = frontmatterMatch[1];
    const result: ChangesetFrontmatter = {};

    // Parse YAML-like frontmatter
    // Format: "@scope/package": minor
    const lines = frontmatter.split('\n').filter(line => line.trim());
    for (const line of lines) {
      const match = line.match(/^["']?([^"':]+)["']?\s*:\s*(major|minor|patch)/);
      if (match) {
        const [, packageName, bumpType] = match;
        result[packageName.trim()] = bumpType as 'major' | 'minor' | 'patch';
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch (error) {
    // Parsing errors will be caught by changeset status
    return null;
  }
}

function checkChangesetPresence(): boolean {
  console.log('\n🔍 Checking for changeset presence...\n');

  try {
    const statusOutput = execSync('yarn changeset status --since=origin/main 2>&1', {
      encoding: 'utf-8'
    });

    if (statusOutput.includes('No changesets present')) {
      console.log(`${RED}❌ No changesets found${RESET}\n`);
      console.log(`${YELLOW}This PR requires a changeset to document the changes.${RESET}`);
      console.log(`${YELLOW}To create a changeset, run: yarn changeset${RESET}\n`);
      return false;
    }

    console.log(`${GREEN}✅ Changesets found${RESET}`);
    return true;
  } catch (error: any) {
    console.log(`${RED}❌ Failed to check changeset status${RESET}\n`);
    console.log(error.message);
    return false;
  }
}

function checkForMajorBumps(): boolean {
  console.log('\n🔍 Checking for major version bumps...\n');

  const changesetFiles = readdirSync(CHANGESETS_DIR)
    .filter(file => file.endsWith('.md') && file !== 'README.md')
    .map(file => join(CHANGESETS_DIR, file));

  if (changesetFiles.length === 0) {
    console.log(`${YELLOW}No changesets found (skipping major check)${RESET}`);
    return true;
  }

  let hasMajor = false;
  const majorBumps: Array<{ file: string; packages: string[] }> = [];

  for (const file of changesetFiles) {
    const frontmatter = parseChangesetForMajorCheck(file);
    if (!frontmatter) continue;

    const majorPackages = Object.entries(frontmatter)
      .filter(([, bumpType]) => bumpType === 'major')
      .map(([pkg]) => pkg);

    if (majorPackages.length > 0) {
      hasMajor = true;
      majorBumps.push({ file, packages: majorPackages });
    }
  }

  if (hasMajor) {
    console.log(`${RED}❌ Major version bumps detected!${RESET}\n`);
    for (const { file, packages } of majorBumps) {
      console.log(`${RED}  ${file}:${RESET}`);
      for (const pkg of packages) {
        console.log(`${RED}    - ${pkg}: major${RESET}`);
      }
    }
    console.log(`\n${RED}Major version bumps are not allowed.${RESET}`);
    console.log(`${YELLOW}If you need to make a breaking change, please discuss with the team first.${RESET}\n`);
    return false;
  }

  console.log(`${GREEN}✅ No major version bumps found${RESET}`);
  return true;
}

function validateChangesetStatus(): boolean {
  console.log('\n🔍 Validating changesets with changeset status...\n');

  try {
    // This validates:
    // - Changeset file format
    // - Package references
    // - Dependency graph
    // - Config validity
    const statusOutput = execSync('yarn changeset status --since=origin/main 2>&1', {
      encoding: 'utf-8'
    });

    // Check for errors (but "No changesets present" is not an error here)
    if (statusOutput.toLowerCase().includes('error') && !statusOutput.includes('No changesets present')) {
      console.log(`${RED}❌ Changeset validation failed!${RESET}\n`);
      console.log(statusOutput);
      return false;
    }

    console.log(`${GREEN}✅ Changeset validation passed${RESET}`);
    return true;
  } catch (error: any) {
    console.log(`${RED}❌ Changeset validation failed!${RESET}\n`);
    console.log(`${RED}Error:${RESET}`, error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.log(error.stderr);
    return false;
  }
}

function main(): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log('Changesets Validation');
  console.log(`${'='.repeat(60)}`);

  const results = {
    presence: checkChangesetPresence(),
    majorBumps: checkForMajorBumps(),
    validation: validateChangesetStatus()
  };

  console.log(`\n${'='.repeat(60)}`);
  console.log('Validation Results:');
  console.log(`${'='.repeat(60)}\n`);

  console.log(`Changeset presence:      ${results.presence ? GREEN + '✅ PASS' : RED + '❌ FAIL'}${RESET}`);
  console.log(`Major version check:     ${results.majorBumps ? GREEN + '✅ PASS' : RED + '❌ FAIL'}${RESET}`);
  console.log(`Changeset validation:    ${results.validation ? GREEN + '✅ PASS' : RED + '❌ FAIL'}${RESET}\n`);

  const allPassed = results.presence && results.majorBumps && results.validation;

  if (!allPassed) {
    console.log(`${RED}Validation failed!${RESET}\n`);
    process.exit(1);
  }

  console.log(`${GREEN}All validations passed! ✅${RESET}\n`);
}

main();
