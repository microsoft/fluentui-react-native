#!/usr/bin/env zx
import 'zx/globals';

/**
 * Validate changesets in CI
 *
 * Checks:
 * 1. Changesets are present (PRs require changesets)
 * 2. No major version bumps (breaking changes disallowed)
 * 3. Changeset status passes (validates format, config, dependencies)
 */

const CHANGESETS_DIR = '.changeset';

// ANSI color codes
const colors = {
  red: (msg: string) => `\x1b[31m${msg}\x1b[0m`,
  green: (msg: string) => `\x1b[32m${msg}\x1b[0m`,
  yellow: (msg: string) => `\x1b[33m${msg}\x1b[0m`,
};

// Logging helpers
const log = {
  error: (msg: string) => echo(colors.red(msg)),
  success: (msg: string) => echo(colors.green(msg)),
  warn: (msg: string) => echo(colors.yellow(msg)),
  info: (msg: string) => echo(msg),
};

interface ChangesetFrontmatter {
  [packageName: string]: 'major' | 'minor' | 'patch';
}

function parseChangesetForMajorCheck(filePath: string): ChangesetFrontmatter | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;

    const frontmatter = frontmatterMatch[1];
    const result = {};

    const lines = frontmatter.split('\n').filter(line => line.trim());
    for (const line of lines) {
      const match = line.match(/^["']?([^"':]+)["']?\s*:\s*(major|minor|patch)/);
      if (match) {
        const [, packageName, bumpType] = match;
        result[packageName.trim()] = bumpType;
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

async function checkChangesetPresence() {
  log.info('\n🔍 Checking for changeset presence...\n');

  try {
    const { stdout } = await $`yarn changeset status --since=origin/main 2>&1`;

    if (stdout.includes('No changesets present')) {
      log.error('❌ No changesets found\n');
      log.warn('This PR requires a changeset to document the changes.');
      log.warn('To create a changeset, run: yarn changeset\n');
      return false;
    }

    log.success('✅ Changesets found');
    return true;
  } catch (error: any) {
    log.error('❌ Failed to check changeset status\n');
    log.info(error.message);
    return false;
  }
}

async function checkForMajorBumps() {
  log.info('\n🔍 Checking for major version bumps...\n');

  const files = fs.readdirSync(CHANGESETS_DIR);
  const changesetFiles = files
    .filter(file => file.endsWith('.md') && file !== 'README.md')
    .map(file => path.join(CHANGESETS_DIR, file));

  if (changesetFiles.length === 0) {
    log.warn('No changesets found (skipping major check)');
    return true;
  }

  let hasMajor = false;
  const majorBumps = [];

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
    log.error('❌ Major version bumps detected!\n');
    for (const { file, packages } of majorBumps) {
      log.error(`  ${file}:`);
      for (const pkg of packages) {
        log.error(`    - ${pkg}: major`);
      }
    }
    log.error('\nMajor version bumps are not allowed.');
    log.warn('If you need to make a breaking change, please discuss with the team first.\n');
    return false;
  }

  log.success('✅ No major version bumps found');
  return true;
}

async function validateChangesetStatus() {
  log.info('\n🔍 Validating changesets with changeset status...\n');

  try {
    const { stdout } = await $`yarn changeset status --since=origin/main 2>&1`;

    if (stdout.toLowerCase().includes('error') && !stdout.includes('No changesets present')) {
      log.error('❌ Changeset validation failed!\n');
      log.info(stdout);
      return false;
    }

    log.success('✅ Changeset validation passed');
    return true;
  } catch (error: any) {
    log.error('❌ Changeset validation failed!\n');
    log.error(`Error: ${error.message}`);
    if (error.stdout) log.info(error.stdout);
    if (error.stderr) log.info(error.stderr);
    return false;
  }
}

// Main execution
log.info(`\n${'='.repeat(60)}`);
log.info('Changesets Validation');
log.info(`${'='.repeat(60)}`);

const results = {
  presence: await checkChangesetPresence(),
  majorBumps: await checkForMajorBumps(),
  validation: await validateChangesetStatus()
};

log.info(`\n${'='.repeat(60)}`);
log.info('Validation Results:');
log.info(`${'='.repeat(60)}\n`);

log.info(`Changeset presence:      ${results.presence ? '✅ PASS' : '❌ FAIL'}`);
log.info(`Major version check:     ${results.majorBumps ? '✅ PASS' : '❌ FAIL'}`);
log.info(`Changeset validation:    ${results.validation ? '✅ PASS' : '❌ FAIL'}\n`);

const allPassed = results.presence && results.majorBumps && results.validation;

if (!allPassed) {
  log.error('Validation failed!\n');
  throw new Error('Validation failed');
}

log.success('All validations passed! ✅\n');
