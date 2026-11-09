import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { DesktopRunReporter } from './collector.js';
import { runDesktopOperation } from './operation.js';
import type { EventData, EventEmitter } from './protocol.js';

describe('runDesktopOperation', () => {
  type Emitted = { event: EventData; scopeId?: string; context?: unknown };

  function recorder(failOn?: EventData['kind']) {
    const emitted: Emitted[] = [];
    const emit: EventEmitter = (event, scopeId, context) => {
      if (event.kind === failOn) throw new Error(`cannot report ${event.kind}`);
      emitted.push({ event, scopeId, context });
    };
    return { writer: { emit }, emitted };
  }

  test('reports a passing operation with its summary and returns the result', async () => {
    const { writer, emitted } = recorder();

    const result = await runDesktopOperation(writer, { label: 'Render stories', scopeId: 'render' }, (operation) => {
      operation.summarize('2 stories rendered');
      return 42;
    });

    expect(result).toBe(42);
    expect(emitted).toEqual([
      { event: { kind: 'scope-start', payload: { label: 'Render stories', category: 'phase' } }, scopeId: 'render', context: undefined },
      { event: { kind: 'scope-end', payload: { status: 'passed', summary: '2 stories rendered' } }, scopeId: 'render', context: undefined },
    ]);
  });

  test('ends a passing operation with an empty summary so that the reporter prints its outcome', async () => {
    const { writer, emitted } = recorder();

    await runDesktopOperation(writer, { label: 'Step', scopeId: 'step' }, () => undefined);

    expect(emitted.at(-1)?.event).toEqual({ kind: 'scope-end', payload: { status: 'passed', summary: '' } });
  });

  test('reports a failure with the first line of its message and throws it again', async () => {
    const { writer, emitted } = recorder();
    const error = new Error('build failed\nsecond line');

    await expect(
      runDesktopOperation(writer, { label: 'Step', scopeId: 'step' }, () => {
        throw error;
      }),
    ).rejects.toBe(error);

    expect(emitted.at(-1)?.event).toEqual({ kind: 'scope-end', payload: { status: 'failed', summary: 'build failed' } });
  });

  test('prefers the summary of the work over the message of its failure', async () => {
    const { writer, emitted } = recorder();

    await expect(
      runDesktopOperation(writer, { label: 'Step', scopeId: 'step' }, async (operation) => {
        operation.summarize('1 of 3 failed');
        throw new Error('details');
      }),
    ).rejects.toThrow('details');

    expect(emitted.at(-1)?.event).toEqual({ kind: 'scope-end', payload: { status: 'failed', summary: '1 of 3 failed' } });
  });

  test('describes a thrown value that is not an error', async () => {
    const { writer, emitted } = recorder();

    await expect(
      runDesktopOperation(writer, { label: 'Step', scopeId: 'step' }, () => {
        throw 'plain text';
      }),
    ).rejects.toBe('plain text');

    expect(emitted.at(-1)?.event).toEqual({ kind: 'scope-end', payload: { status: 'failed', summary: 'plain text' } });
  });

  test('throws the failure of the work, not the failure to report it', async () => {
    const { writer } = recorder('scope-end');
    const error = new Error('real failure');

    await expect(
      runDesktopOperation(writer, { label: 'Step' }, () => {
        throw error;
      }),
    ).rejects.toBe(error);
  });

  test('surfaces a failure to report a passing operation', async () => {
    const { writer } = recorder('scope-end');

    await expect(runDesktopOperation(writer, { label: 'Step' }, () => 1)).rejects.toThrow('cannot report scope-end');
  });

  test('records detail as one stdout line per non-empty line, in the scope and context of the operation', async () => {
    const { writer, emitted } = recorder();
    const context = { service: 'storybook', endpoint: 'macos' } as const;

    await runDesktopOperation(writer, { label: 'Step', scopeId: 'step', context, category: 'worker' }, (operation) => {
      operation.log('one\n\ntwo  \r\n');
    });

    expect(emitted.map(({ event }) => event.kind)).toEqual(['scope-start', 'output', 'output', 'scope-end']);
    expect(emitted[0].event).toEqual({ kind: 'scope-start', payload: { label: 'Step', category: 'worker' } });
    expect(emitted.slice(1, 3).map(({ event, scopeId, context: eventContext }) => ({ event, scopeId, eventContext }))).toEqual([
      { event: { kind: 'output', payload: { stream: 'stdout', text: 'one\n' } }, scopeId: 'step', eventContext: context },
      { event: { kind: 'output', payload: { stream: 'stdout', text: 'two\n' } }, scopeId: 'step', eventContext: context },
    ]);
    expect(emitted[3].context).toBe(context);
  });

  test('keeps a summary to one line', async () => {
    const { writer, emitted } = recorder();

    await runDesktopOperation(writer, { label: 'Step' }, (operation) => {
      operation.summarize('first\nsecond');
    });

    expect(emitted.at(-1)?.event).toMatchObject({ payload: { summary: 'first second' } });
  });

  test('runs the work when nothing is listening', async () => {
    const result = await runDesktopOperation(undefined, { label: 'Step' }, (operation) => {
      operation.summarize('ignored');
      operation.log('ignored');
      return 'done';
    });

    expect(result).toBe('done');
  });

  describe('with a reporter', () => {
    let artifactsRoot: string;
    let out: string;
    let err: string;

    beforeEach(() => {
      artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-operation-'));
      out = '';
      err = '';
    });

    afterEach(() => {
      fs.rmSync(artifactsRoot, { force: true, recursive: true });
    });

    function start(verbose: boolean, kind: 'tests' | 'lifecycle' = 'tests') {
      return new DesktopRunReporter({
        artifactsRoot,
        kind,
        output: { write: (chunk: string) => ((out += chunk), true) },
        errorOutput: { write: (chunk: string) => ((err += chunk), true) },
        reporterMode: 'plain',
        summary: false,
        verbose,
      });
    }

    test('a passing operation prints one header line and keeps its detail out of the output', async () => {
      const reporter = start(false);

      await runDesktopOperation(reporter, { label: 'Render stories' }, (operation) => {
        operation.log('rendered one');
        operation.summarize('1 stories rendered');
      });
      await reporter.flush();

      expect(out).toMatch(/^✔ Render stories \([^)]+\): 1 stories rendered\n$/);
      expect(err).toBe('');
    });

    test('verbose output shows the detail between the start and the header', async () => {
      const reporter = start(true);

      await runDesktopOperation(reporter, { label: 'Render stories' }, (operation) => {
        operation.log('rendered one');
      });
      await reporter.flush();

      expect(out).toMatch(/^▶ Render stories\nrendered one\n✔ Render stories \([^)]+\)\n$/);
    });

    test('a failing operation prints its header on the error stream', async () => {
      const reporter = start(false);

      await expect(
        runDesktopOperation(reporter, { label: 'Render stories' }, () => {
          throw new Error('1 of 3 stories failed to render');
        }),
      ).rejects.toThrow('1 of 3 stories failed to render');
      await reporter.flush();

      expect(out).toBe('');
      expect(err).toMatch(/^✖ Render stories \([^)]+\): 1 of 3 stories failed to render\n$/);
    });

    test('redacts secrets from the summary', async () => {
      const reporter = start(false);
      reporter.addSecret('hunter2');

      await runDesktopOperation(reporter, { label: 'Sign in' }, (operation) => {
        operation.summarize('token hunter2 accepted');
      });
      await reporter.flush();

      expect(out).toContain('token [REDACTED] accepted');
      expect(out).not.toContain('hunter2');
    });

    test('operations can repeat on one reporter, and each one completes', async () => {
      const reporter = start(false, 'lifecycle');

      await runDesktopOperation(reporter, { label: 'Step' }, () => undefined);
      await runDesktopOperation(reporter, { label: 'Step' }, () => undefined);

      await expect(reporter.finish()).resolves.toMatchObject({ status: 'passed' });
      expect(out.match(/✔ Step/g)).toHaveLength(2);
    });
  });
});
