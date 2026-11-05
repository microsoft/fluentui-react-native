import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { DesktopRunReporter } from './collector.js';

describe('desktop run reporter final output', () => {
  let artifactsRoot: string;

  beforeEach(() => {
    artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-collector-'));
  });

  afterEach(() => {
    fs.rmSync(artifactsRoot, { force: true, recursive: true });
  });

  async function finishFailedRun(ready: boolean): Promise<string> {
    let written = '';
    const output = {
      write: (chunk: string) => {
        written += chunk;
        return true;
      },
    };
    const reporter = new DesktopRunReporter({
      artifactsRoot,
      errorOutput: output,
      kind: 'lifecycle',
      output,
      reporterMode: 'json',
      summary: false,
      suppressFinalOutput: () => ready,
    });
    reporter.fail(new Error('The workload is already claimed.'));
    await reporter.finish();
    return written;
  }

  test('a long-lived command that fails before readiness still writes its summary', async () => {
    const summary = JSON.parse(await finishFailedRun(false));

    expect(summary).toMatchObject({ status: 'failed' });
  });

  test('a ready long-lived command keeps its readiness document as the only output', async () => {
    expect(await finishFailedRun(true)).toBe('');
  });
});
