import os from 'node:os';
import path from 'node:path';

import { projectDesktopRunSummary, summarizeDesktopRun } from './results.js';

describe('bounded desktop run summary', () => {
  test('keeps large suites and failure messages within the document limit', () => {
    const longMessage = 'failure '.repeat(128 * 1024);
    const tests = Array.from({ length: 10_000 }, (_, index) => ({
      testId: `test-${index}`,
      title: index === 0 ? longMessage : `Test ${index}`,
      status: 'failed' as const,
      flaky: false,
      attempts: [
        {
          attempt: 0,
          status: 'failed' as const,
          durationMs: 1,
          failure: { failureId: `failure-${index}`, kind: 'test' as const, error: { name: 'Error', message: longMessage } },
        },
      ],
    }));
    const result = summarizeDesktopRun({
      schemaVersion: 1,
      runId: 'run-id',
      kind: 'tests',
      startedAt: new Date(0).toISOString(),
      finishedAt: new Date(1).toISOString(),
      durationMs: 1,
      tests,
      work: [],
      failures: Array.from({ length: 1_000 }, (_, index) => ({
        failureId: `infrastructure-${index}`,
        kind: 'infrastructure' as const,
        error: { name: 'Error', message: `Failure ${index}` },
      })),
      artifacts: [
        { path: 'events.jsonl', description: 'event journal' },
        { path: 'run.json', description: 'result' },
        { path: 'junit.xml', description: 'JUnit' },
      ],
    });
    const root = path.join(os.tmpdir(), 'desktop-artifacts', 'run-id');
    const summary = projectDesktopRunSummary(result, root);

    expect(summary.problems.length).toBeLessThanOrEqual(10);
    expect(summary.omissions.problems).toBeGreaterThan(0);
    expect(Buffer.byteLength(JSON.stringify(summary))).toBeLessThanOrEqual(4 * 1024);
    expect(summary.artifacts.runJson).toBe(path.join(root, 'run.json'));
  });
});
