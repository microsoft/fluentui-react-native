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

interface ChangesetStatusOutput {
  releases: Array<{
    name: string;
    type: 'major' | 'minor' | 'patch' | 'none';
    oldVersion: string;
    newVersion: string;
    changesets: string[];
  }>;
  changesets: string[];
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

  try {
    await $`yarn changeset status --output bumps.json`;

    const bumpsData: ChangesetStatusOutput = JSON.parse(fs.readFileSync('bumps.json', 'utf-8'));
    fs.unlinkSync('bumps.json');

    const majorBumps = bumpsData.releases.filter(release => release.type === 'major');

    if (majorBumps.length > 0) {
      log.error('❌ Major version bumps detected!\n');
      for (const release of majorBumps) {
        log.error(`  ${release.name}: major`);
        if (release.changesets.length > 0) {
          log.error(`    (from changesets: ${release.changesets.join(', ')})`);
        }
      }
      log.error('\nMajor version bumps are not allowed.');
      log.warn('If you need to make a breaking change, please discuss with the team first.\n');
      return false;
    }

    log.success('✅ No major version bumps found');
    return true;
  } catch (error: any) {
    // Clean up temp file if it exists
    if (fs.existsSync('bumps.json')) {
      fs.unlinkSync('bumps.json');
    }
    log.error('❌ Failed to check for major bumps\n');
    log.error(`Error: ${error.message}`);
    return false;
  }
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
