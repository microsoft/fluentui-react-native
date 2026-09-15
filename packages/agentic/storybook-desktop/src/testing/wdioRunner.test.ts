import { spawn } from 'node:child_process';
import path from 'node:path';

// This aggregate contract starts dozens of Node workers, including intentional timeouts.
test('executes isolated inline code and releases sessions after assertion failures, timeouts, and crashes', async () => {
  const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, 'wdioRunner.contract.cjs')], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.once('error', reject);
    child.once('close', (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderr).toString('utf8') || `Inline test contract exited with ${code}.`));
      } else {
        const output = Buffer.concat(stdout).toString('utf8');
        const diagnostics = Buffer.concat(stderr).toString('utf8');
        if (
          !diagnostics.includes('intentional inline assertion') ||
          !diagnostics.includes('wdio "fixture-button--fail" during execution') ||
          !diagnostics.includes('wdio "fixture-button--navigation-failure" during navigation') ||
          !diagnostics.includes('Navigation failed: preview did not mount') ||
          output.includes('[storybook] OK wdio "fixture-button--exit-zero"')
        ) {
          reject(new Error('Assertion diagnostics were lost.'));
        } else {
          resolve(JSON.parse(output.split('\nWDIO_RESULT ')[1]));
        }
      }
    });
  });
  expect(result).toMatchObject({
    passed: ['fixture-button--pass'],
    skipped: ['fixture-button--skip'],
    failures: ['fail', 'timeout', 'spin', 'crash', 'exit-zero', 'stale', 'navigation-failure'],
    repeated: ['fixture-button--pass'],
    grouped: ['fixture-button--pass', 'fixture-button--second'],
    groupedSelections: ['fixture-button--pass', 'fixture-button--second'],
    smoke: {
      plans: ['fixture-button--pass', 'fixture-button--second'],
      callbacks: ['fixture-button--pass', 'fixture-button--second'],
      selections: ['fixture-button--pass', 'fixture-button--pass', 'fixture-button--second', 'fixture-button--second'],
      status: 'passed',
    },
    smokeFailureLogged: true,
    button: [
      { testName: 'exposes enabled button semantics', status: 'passed' },
      { testName: 'supports native pointer activation', status: 'passed' },
    ],
    restrictedButton: [
      { testName: 'exposes enabled button semantics', status: 'passed' },
      { testName: 'supports native pointer activation', status: 'skipped' },
    ],
    platforms: Object.fromEntries(
      ['macos', 'windows', 'win32'].map((platform) => [
        platform,
        [
          { testName: 'mutates state', status: 'passed' },
          { testName: 'starts fresh', status: 'passed' },
        ],
      ]),
    ),
    namedFailureResults: [
      { testName: 'a b', status: 'failed' },
      { testName: 'a-b', status: 'failed' },
      { testName: 'recovers', status: 'passed' },
    ],
    namedTimeout: [
      { testName: 'times out', status: 'failed' },
      { testName: 'runs afterward', status: 'passed' },
    ],
    generatedFiles: [],
    attachedOnly: true,
  });
}, 120_000);
