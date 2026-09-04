import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

jest.setTimeout(30_000);

describe('representative desktop story plans', () => {
  test('extracts and runs the complete portable semantic cohort through WebdriverIO', async () => {
    const artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'representative-story-plans-'));
    try {
      const response = await runContract(artifactsRoot);
      expect(response).toMatchObject({
        planned: [
          { id: 'components-button--default', tests: ['accessibility-contract', 'pointer-activation', 'focus-survival'] },
          { id: 'components-button--overview', tests: ['tab-focus-movement'] },
          { id: 'components-card--interactive', tests: ['accessibility-contract', 'focus-survival'] },
          { id: 'components-checkbox--default', tests: ['accessibility-contract', 'toggles-checked-state', 'focus-survival'] },
          { id: 'components-divider--default', tests: ['accessibility-contract'] },
          { id: 'components-input--default', tests: ['accessibility-contract', 'types-and-clears'] },
          { id: 'components-listboxitem--default', tests: ['accessibility-contract', 'focus-survival'] },
          { id: 'components-listitem--selected-focus', tests: ['accessibility-contract', 'focus-survival'] },
          { id: 'components-menuitem--selected', tests: ['accessibility-contract', 'focus-survival'] },
          { id: 'components-radio--default', tests: ['accessibility-contract', 'focus-survival'] },
          { id: 'components-switch--default', tests: ['accessibility-contract', 'toggles-checked-state', 'focus-survival'] },
          { id: 'components-tab--selected', tests: ['accessibility-contract', 'focus-survival'] },
          { id: 'components-tag--default', tests: ['accessibility-contract', 'focus-survival'] },
          { id: 'native-focuszone--default', tests: ['linear-navigation-and-tab-exit'] },
          { id: 'native-focuszone--two-dimensional-navigation', tests: ['geometric-navigation'] },
          { id: 'primitives-focus-visual--windows-accordion-consumer-regression', tests: ['focus-survival'] },
        ],
        result: {
          status: 'passed',
          summary: { failed: 0, passed: 12, quarantined: 0, selected: 30, skipped: 18 },
        },
        repeated: {
          status: 'passed',
          summary: { failed: 0, passed: 12, quarantined: 0, selected: 30, skipped: 18 },
        },
      });
      expect(fs.existsSync(path.join(artifactsRoot, 'run.json'))).toBe(true);
      expect(fs.existsSync(path.join(artifactsRoot, 'junit.xml'))).toBe(true);
      expect(fs.existsSync(path.join(artifactsRoot, 'events.ndjson'))).toBe(true);
    } finally {
      fs.rmSync(artifactsRoot, { force: true, recursive: true });
    }
  });
});

function runContract(artifactsRoot: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, 'representativePlans.contract.cjs'), artifactsRoot], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderr).toString('utf8') || `Representative plan process exited with code ${code}.`));
        return;
      }
      resolve(JSON.parse(Buffer.concat(stdout).toString('utf8')) as Record<string, unknown>);
    });
  });
}
