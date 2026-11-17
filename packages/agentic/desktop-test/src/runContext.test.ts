import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { ResolvedDesktopTarget } from './config.js';
import { DesktopWorkloadService } from './control.js';
import type { DesktopWorkloadRun } from './control.js';
import { DESKTOP_REPORT_CONTEXT } from './reporting/transport.js';
import { createDesktopRunContext } from './runContext.js';

describe('isolated desktop run context', () => {
  let root: string;
  let target: ResolvedDesktopTarget;
  let previousContext: string | undefined;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-managed-run-'));
    previousContext = process.env[DESKTOP_REPORT_CONTEXT];
    target = {
      endpoint: 'macos',
      id: 'target',
      registrationId: 'target',
      instanceId: 'instance',
      projectRoot: root,
      configPath: path.join(root, 'desktop.config.mts'),
      host: { kind: 'installed', ownership: 'external' },
    };
  });

  afterEach(() => {
    if (previousContext === undefined) delete process.env[DESKTOP_REPORT_CONTEXT];
    else process.env[DESKTOP_REPORT_CONTEXT] = previousContext;
    fs.rmSync(root, { force: true, recursive: true });
  });

  const reporting = (artifactsRoot: string) => ({
    artifactsRoot,
    kind: 'tests' as const,
    reporterMode: 'plain' as const,
    output: { write: () => true },
    errorOutput: { write: () => true },
    summary: false as const,
  });

  test('owns a new report rather than inheriting the host report or acquiring a workload claim', async () => {
    process.env[DESKTOP_REPORT_CONTEXT] = 'not-an-inherited-report';
    const host = new AbortController();
    const bindReporter = jest.fn();
    const run = await createDesktopRunContext({ target, reporting: reporting(root), hostSignal: host.signal, bindReporter });
    try {
      expect(bindReporter).toHaveBeenCalledWith(run.reporter);
      await run.run(new AbortController().signal, async (owner) => {
        owner.reporter.emit({
          kind: 'test-result',
          payload: { testId: 'case', title: 'case', status: 'passed', attempt: 0, durationMs: 1 },
        });
      });
      await run.finish();
      const report = JSON.parse(fs.readFileSync(path.join(run.reporter.root, 'run.json'), 'utf8'));
      expect(report).toMatchObject({ runId: run.reporter.runId, terminal: true, status: 'passed' });
      expect(host.signal.aborted).toBe(false);
    } finally {
      await run.finish();
    }
  });

  test('an owned CLI run holds its claim while executing and releases it after cleanup', async () => {
    const locks = path.join(root, 'locks');
    const run = await createDesktopRunContext({
      target,
      reporting: reporting(root),
      claim: true,
      supervisor: {
        lockDirectory: locks,
        hostFactory: async () => {
          throw new Error('No driver is needed for this run.');
        },
      },
    });
    const marker = path.join(locks, 'interactive.lock');
    expect(fs.existsSync(marker)).toBe(false);
    await run.run(undefined, async (owner) => {
      expect(fs.existsSync(marker)).toBe(true);
      owner.reporter.emit({
        kind: 'test-result',
        payload: { testId: 'case', title: 'case', status: 'passed', attempt: 0, durationMs: 1 },
      });
    });
    expect(fs.existsSync(marker)).toBe(true);
    expect(await run.finish()).toBe(0);
    expect(fs.existsSync(marker)).toBe(false);
  });

  test('does not acquire an owned claim for a run cancelled before execution', async () => {
    const locks = path.join(root, 'locks');
    const run = await createDesktopRunContext({
      target,
      reporting: reporting(root),
      claim: true,
      supervisor: {
        lockDirectory: locks,
        hostFactory: async () => {
          throw new Error('No driver is needed for this run.');
        },
      },
    });
    const cancellation = new AbortController();
    cancellation.abort();
    await expect(run.run(cancellation.signal, async () => undefined)).rejects.toMatchObject({ name: 'AbortError' });
    await run.finish(cancellation.signal.reason);
    expect(fs.existsSync(path.join(locks, 'interactive.lock'))).toBe(false);
  });

  test('cancels and drains an actual worker while keeping the host running and the report incomplete', async () => {
    const host = new AbortController();
    let started!: () => void;
    const workerStarted = new Promise<void>((resolve) => (started = resolve));
    let runRoot = '';
    const service = new DesktopWorkloadService({
      catalog: [{ id: 'suite', kind: 'wdio', lanes: ['physical'] }],
      prepare: async ({ bindReporter }) => {
        const context = await createDesktopRunContext({ target, reporting: reporting(root), hostSignal: host.signal, bindReporter });
        runRoot = context.reporter.root;
        return {
          runId: context.reporter.runId,
          root: runRoot,
          run: (signal) =>
            context.run(signal, async (owner) => {
              const work = owner.worker(
                {
                  command: process.execPath,
                  args: ['-e', 'setInterval(() => {}, 1000)'],
                  cwd: root,
                  env: {},
                  label: 'managed worker',
                },
                30_000,
              );
              started();
              await work;
            }),
          finish: async (failure) => {
            await context.finish(failure);
          },
        };
      },
    });
    const principal = service.connect(service.credential);
    try {
      const accepted = await service.request(principal, { action: 'run', workload: 'suite', lane: 'physical', requestId: 'cancel-me' });
      if (!('run' in accepted) || !accepted.run) throw new Error('Run was not admitted.');
      await workerStarted;
      await service.request(principal, { action: 'cancel', handle: accepted.run.handle });
      const settled = await waitForRun(service, principal, accepted.run.handle);
      expect(settled).toMatchObject({ cancellation: 'requested', outcome: 'incomplete', cleanup: 'settled' });
      expect(host.signal.aborted).toBe(false);
      const report = JSON.parse(fs.readFileSync(path.join(runRoot, 'run.json'), 'utf8'));
      expect(report).toMatchObject({ terminal: true, status: 'incomplete' });
      await service.dispose(principal);
    } finally {
      await service.close();
    }
  }, 30_000);
});

async function waitForRun(service: DesktopWorkloadService, principal: string, handle: string): Promise<DesktopWorkloadRun> {
  for (let attempt = 0; attempt < 400; attempt++) {
    const response = await service.request(principal, { action: 'status', handle, waitMs: 100 });
    if ('run' in response && response.run?.phase === 'settled') return response.run;
  }
  throw new Error('The desktop workload did not settle.');
}
