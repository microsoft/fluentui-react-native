import { spawn } from 'node:child_process';
import path from 'node:path';

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
        if (!output.includes('intentional inline assertion')) {
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
    failures: ['fail', 'timeout', 'spin', 'crash', 'exit-zero', 'stale'],
    repeated: ['fixture-button--pass'],
    button: ['components-button--default'],
    generatedFiles: [],
    attachedOnly: true,
  });
}, 60_000);
