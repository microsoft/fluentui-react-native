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
          !diagnostics.includes('Storybook context did not settle.') ||
          !diagnostics.includes('wdio "fixture-button--lane / accessible only" during input policy verification') ||
          diagnostics.includes('Navigation refused before dispatch') ||
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
      // The tests phase first waits for runtime readiness by selecting the manifest's first story.
      selections: [
        'fixture-button--crash',
        'fixture-button--pass',
        'fixture-button--pass',
        'fixture-button--second',
        'fixture-button--second',
      ],
      status: 'passed',
    },
    smokeFailureLogged: true,
    button: [
      { testName: 'exposes enabled button semantics', status: 'passed' },
      { testName: 'supports native pointer activation', status: 'passed' },
    ],
    // The migrated case declares physical-click, so a host without it reports the case unsupported before execution.
    restrictedButton: [
      { testName: 'exposes enabled button semantics', status: 'passed' },
      { testName: 'supports native pointer activation', status: 'unsupported' },
    ],
    lane: {
      accessible: [
        { testName: 'accessible only', status: 'passed' },
        { testName: 'either lane', status: 'passed' },
      ],
      physical: [
        { testName: 'either lane', status: 'passed' },
        { testName: 'physical only', status: 'passed' },
      ],
      // No lane, and a host that masks physical click: the physical case is unsupported, not a failed session.
      compatibility: [
        { testName: 'accessible only', status: 'passed' },
        { testName: 'either lane', status: 'passed' },
        { testName: 'physical only', status: 'unsupported' },
      ],
      // The driver holds the policy, so an accessible lane runs on a driver with physical input enabled.
      unmasked: [
        { testName: 'accessible only', status: 'passed' },
        { testName: 'either lane', status: 'passed' },
      ],
      // A driver that does not confirm the policy stops the lane at its first case, reported once.
      unconfirmed: {
        results: [{ testName: 'accessible only', status: 'failed' }],
        status: 'failed',
        failed: 1,
        excluded: { platform: 0, scope: 0, input: 1 },
        reported: [expect.stringContaining('did not confirm the accessible input policy (it reported none)')],
      },
    },
    receipts: {
      // Compatibility mode delivers what the host has, and still holds each declared case to its declaration.
      compatibility: [
        { testName: 'declared click', status: 'passed', input: { receipts: { 'physical-click': 1 } } },
        {
          testName: 'undeclared click',
          status: 'failed',
          input: { receipts: { 'physical-click': 1 }, undeclared: ['physical-click'] },
          error: 'The test delivered input it does not declare: physical-click (declare physical-click or click).',
        },
        { testName: 'unused keyboard', status: 'passed', input: { receipts: {}, unused: ['keyboard'] } },
        {
          testName: 'typing',
          status: 'failed',
          input: { receipts: { keyboard: 1 }, undeclared: ['keyboard'] },
          error: 'The test delivered input it does not declare: keyboard (declare keyboard).',
        },
      ],
      // The accessible lane clicks semantically and refuses typing before it is delivered, so nothing is attributed to it.
      accessible: [
        { testName: 'declared click', status: 'passed', input: { receipts: { 'accessibility-click': 1 } } },
        {
          testName: 'undeclared click',
          status: 'failed',
          input: { receipts: { 'accessibility-click': 1 }, undeclared: ['accessibility-click'] },
        },
        {
          testName: 'typing',
          status: 'failed',
          input: { receipts: {} },
          error: expect.stringContaining('never delivers'),
        },
      ],
    },
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
