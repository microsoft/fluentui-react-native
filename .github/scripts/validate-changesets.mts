#!/usr/bin/env node
// @ts-ignore
import { styleText } from 'node:util';
import { $, echo, fs } from 'zx';

/**
 * Validate changesets in CI
 *
 * Checks for major version bumps (breaking changes disallowed).
 * Private/ignored packages (per .changeset/config.json) are excluded automatically.
 */

const tmpDir = fs.mkdtempSync('/tmp/changeset-status-');
const STATUS_FILE = `${tmpDir}/status.json`;

const log = {
  error: (msg: string) => echo(styleText('red', msg)),
  success: (msg: string) => echo(styleText('green', msg)),
  warn: (msg: string) => echo(styleText('yellow', msg)),
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

log.info(`\n${'='.repeat(60)}`);
log.info('Changesets Validation');
log.info(`${'='.repeat(60)}\n`);

// Pre-write empty state so changeset status always has a file to overwrite
fs.writeJsonSync(STATUS_FILE, { releases: [], changesets: [] });

await $`yarn changeset status --since=origin/main --output ${STATUS_FILE}`.nothrow();

const data: ChangesetStatusOutput = fs.readJsonSync(STATUS_FILE);
fs.removeSync(tmpDir);

// Fail: major version bumps
const majorBumps = data.releases.filter((release) => release.type === 'major');
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
  throw new Error('Validation failed');
}

// Pass
if (data.releases.length === 0) {
  log.info('ℹ️ No public packages changed — no changeset required');
} else {
  log.success(`✅ Changesets found (${data.releases.map((r) => r.name).join(', ')})`);
}
log.success('\nAll validations passed! ✅\n');
