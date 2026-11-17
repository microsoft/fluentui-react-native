import { spawn } from 'node:child_process';
import path from 'node:path';

test('hands a verified MCP controller to a real managed WDIO run without exposing credentials', async () => {
  const contract = path.resolve(__dirname, '../../desktop-test/src/wdio/runner.contract.cjs');
  const result = await new Promise<unknown>((resolve, reject) => {
    const child = spawn(process.execPath, ['--throw-deprecation', contract, 'managed-mcp'], { stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on('data', (data: Buffer) => stdout.push(data));
    child.stderr.on('data', (data: Buffer) => stderr.push(data));
    child.once('error', reject);
    child.once('close', (code) => {
      if (code !== 0) reject(new Error(Buffer.concat(stderr).toString('utf8') || Buffer.concat(stdout).toString('utf8')));
      else {
        try {
          resolve(JSON.parse(Buffer.concat(stdout).toString('utf8')));
        } catch (error) {
          reject(error);
        }
      }
    });
  });
  expect(result).toEqual({ mode: 'managed-mcp', passed: true });
}, 120_000);
