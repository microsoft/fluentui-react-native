import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

jest.setTimeout(30_000);

describe('representative desktop story tests', () => {
  test('runs actual WDIO stories and guards complete catalog migration and type coverage', async () => {
    const artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'representative-story-plans-'));
    try {
      const response = await runContract(artifactsRoot);
      expect(response).toMatchObject({
        planned: [
          { id: 'components-button--default', tests: ['exposes enabled button semantics', 'supports native pointer activation'] },
          { id: 'components-checkbox--default', tests: ['toggles native checked state in both directions'] },
          { id: 'components-input--default', tests: ['accepts keyboard input and clears it'] },
        ],
        result: [
          { status: 'passed', testName: 'exposes enabled button semantics' },
          { status: 'passed', testName: 'supports native pointer activation' },
          { status: 'passed', testName: 'toggles native checked state in both directions' },
          { status: 'passed', testName: 'accepts keyboard input and clears it' },
        ],
        repeated: [
          { status: 'passed', testName: 'exposes enabled button semantics' },
          { status: 'passed', testName: 'supports native pointer activation' },
          { status: 'passed', testName: 'toggles native checked state in both directions' },
          { status: 'passed', testName: 'accepts keyboard input and clears it' },
        ],
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
