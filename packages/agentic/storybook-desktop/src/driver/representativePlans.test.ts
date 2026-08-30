import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

jest.setTimeout(30_000);

describe('representative desktop story plans', () => {
  test('extracts and runs Button, Checkbox, and Input plans unchanged through WebdriverIO', async () => {
    const artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'representative-story-plans-'));
    try {
      const response = await runContract(artifactsRoot);
      expect(response).toMatchObject({
        planned: [
          { id: 'components-button--default', tests: ['pointer-focus'] },
          { id: 'components-checkbox--default', tests: ['toggles-checked-state'] },
          { id: 'components-input--default', tests: ['types-and-clears'] },
        ],
        result: {
          status: 'passed',
          tests: [
            { status: 'passed', testId: 'pointer-focus' },
            { status: 'passed', testId: 'toggles-checked-state' },
            { status: 'passed', testId: 'types-and-clears' },
          ],
        },
        repeated: {
          status: 'passed',
          tests: [
            { status: 'passed', testId: 'pointer-focus' },
            { status: 'passed', testId: 'toggles-checked-state' },
            { status: 'passed', testId: 'types-and-clears' },
          ],
        },
      });
      expect(fs.existsSync(path.join(artifactsRoot, 'run.json'))).toBe(true);
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
