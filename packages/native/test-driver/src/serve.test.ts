/**
 * Tests for the packaged desktop test server: run-executor command derivation, the Storybook
 * channel announcement, and manifest loading.
 *
 * These avoid binding a socket so they run in restricted environments; `spawn` and `fetch` are
 * injected.
 */

import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { buildInvocation, createWebdriverIoRunExecutor, resolveRunnerCommand } from './storybook/run-executor.ts';
import { createAnnouncement, DESKTOP_SERVICE_ANNOUNCE_EVENT, startServiceAnnouncer } from './storybook/announce.ts';
import { loadStoryTestManifest } from './storybook/serve.ts';
import { StoryController } from './storybook/controller.ts';
import { DesktopCancelledError, DesktopValidationError } from './errors.ts';
import type { StoryTestManifest } from './types.ts';

const manifest: StoryTestManifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  digest: 'deadbeef',
  entries: [
    {
      storyId: 'components-button--default',
      title: 'Components/Button',
      name: 'Default',
      tag: '[story:components-button--default]',
      spec: '/repo/desktop-tests/generated/story-plans.generated.spec.ts',
      grep: '\\[story:components-button--default\\]',
      plan: { kind: 'inline', id: 'button-default', steps: [{ action: 'wait', milliseconds: 1 }] },
      storyPath: '/repo/button.stories.tsx',
    },
  ],
};

const runner = { command: 'yarn', args: ['wdio', 'run', 'wdio.conf.ts'], cwd: '/repo' };

/** Minimal ChildProcess double with the streams and events the executor listens to. */
class FakeChild extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  killed = false;
  kill(): boolean {
    this.killed = true;
    return true;
  }
}

describe('runner command resolution', () => {
  it('appends .cmd for a bare command on Windows only', () => {
    expect(resolveRunnerCommand('yarn', 'win32')).toBe('yarn.cmd');
    expect(resolveRunnerCommand('yarn', 'darwin')).toBe('yarn');
    expect(resolveRunnerCommand('yarn', 'linux')).toBe('yarn');
  });

  it('leaves an explicit path or suffixed command alone', () => {
    expect(resolveRunnerCommand('C:\\tools\\yarn.cmd', 'win32')).toBe('C:\\tools\\yarn.cmd');
    expect(resolveRunnerCommand('./bin/runner.exe', 'win32')).toBe('./bin/runner.exe');
    expect(resolveRunnerCommand('node_modules/.bin/wdio', 'win32')).toBe('node_modules/.bin/wdio');
  });

  it('derives the invocation entirely from configuration and the manifest entry', () => {
    const invocation = buildInvocation(runner, manifest.entries[0], 'darwin');

    expect(invocation.command).toBe('yarn');
    expect(invocation.args).toEqual(['wdio', 'run', 'wdio.conf.ts', '--spec', manifest.entries[0].spec]);
    expect(invocation.env.DESKTOP_TEST_GREP).toBe(manifest.entries[0].grep);
    expect(invocation.windowsVerbatimArguments).toBeUndefined();
  });

  it('runs a Windows launcher through the command interpreter with every argument quoted', () => {
    // Node fails with EINVAL when asked to spawn a .cmd directly, and `shell: true` would join the
    // arguments unquoted, so a spec path containing a space has to survive this.
    const spaced = { spec: 'C:\\dev\\my repo\\generated.spec.ts', grep: '\\[story:x\\]' };
    const invocation = buildInvocation(runner, spaced, 'win32');

    expect(invocation.command.toLowerCase()).toContain('cmd.exe');
    expect(invocation.args.slice(0, 3)).toEqual(['/d', '/s', '/c']);
    expect(invocation.args[3]).toBe('""yarn.cmd" "wdio" "run" "wdio.conf.ts" "--spec" "C:\\dev\\my repo\\generated.spec.ts""');
    expect(invocation.windowsVerbatimArguments).toBe(true);
    expect(invocation.env.DESKTOP_TEST_GREP).toBe(spaced.grep);
  });

  it('leaves a real executable unwrapped on Windows', () => {
    // A bare command is always treated as a launcher, so an executable is named explicitly.
    const invocation = buildInvocation({ ...runner, command: 'node.exe' }, manifest.entries[0], 'win32');

    expect(invocation.command).toBe('node.exe');
    expect(invocation.args).toContain('--spec');
    expect(invocation.windowsVerbatimArguments).toBeUndefined();
  });

  it('refuses an argument the command interpreter cannot be given safely', () => {
    const hostile = { spec: 'C:\\dev\\repo & calc.exe\\generated.spec.ts', grep: 'x' };

    expect(() => buildInvocation(runner, hostile, 'win32')).toThrow(DesktopValidationError);
  });
});

describe('run executor', () => {
  function createExecutor(behaviour: (child: FakeChild) => void, platform: NodeJS.Platform = 'darwin') {
    const calls: { command: string; args: readonly string[]; options?: { windowsVerbatimArguments?: boolean } }[] = [];
    const spawnImpl = ((command: string, args: readonly string[], options?: { windowsVerbatimArguments?: boolean }) => {
      calls.push({ command, args, options });
      const child = new FakeChild();
      setTimeout(() => behaviour(child), 0);
      return child as never;
    }) as never;

    // The platform is pinned so the assertions below describe the executor, not the host.
    return { calls, execute: createWebdriverIoRunExecutor({ manifest, runner, spawnImpl, platform }) };
  }

  it('passes a story when the runner exits zero', async () => {
    const { calls, execute } = createExecutor((child) => child.emit('exit', 0, null));
    const progress: string[] = [];

    const results = await execute(['components-button--default'], (result) => progress.push(result.status), new AbortController().signal);

    expect(results[0].status).toBe('passed');
    expect(progress).toEqual(['passed']);
    expect(calls[0].args).toContain('--spec');
  });

  it('spawns a Windows launcher verbatim through the command interpreter', async () => {
    const { calls, execute } = createExecutor((child) => child.emit('exit', 0, null), 'win32');

    await execute(['components-button--default'], () => undefined, new AbortController().signal);

    expect(calls[0].command.toLowerCase()).toContain('cmd.exe');
    expect(calls[0].options?.windowsVerbatimArguments).toBe(true);
  });

  it('fails the story when the runner exits non-zero', async () => {
    const { execute } = createExecutor((child) => child.emit('exit', 1, null));

    const results = await execute(['components-button--default'], () => undefined, new AbortController().signal);

    expect(results[0].status).toBe('failed');
    expect(results[0].error?.message).toContain('code 1');
  });

  it('reports a spawn failure instead of leaving the run hanging', async () => {
    const { execute } = createExecutor((child) => child.emit('error', new Error('spawn ENOENT')));

    const results = await execute(['components-button--default'], () => undefined, new AbortController().signal);

    expect(results[0].status).toBe('failed');
    expect(results[0].error?.message).toContain('Failed to start the test runner');
  });

  it('settles once when error and exit both fire', async () => {
    const { execute } = createExecutor((child) => {
      child.emit('error', new Error('spawn ENOENT'));
      child.emit('exit', 1, null);
    });

    const results = await execute(['components-button--default'], () => undefined, new AbortController().signal);

    expect(results).toHaveLength(1);
    expect(results[0].error?.message).toContain('Failed to start the test runner');
  });

  it('rejects with a cancellation error when aborted before a story starts', async () => {
    const { execute } = createExecutor((child) => child.emit('exit', 0, null));
    const controller = new AbortController();
    controller.abort();

    await expect(execute(['components-button--default'], () => undefined, controller.signal)).rejects.toBeInstanceOf(DesktopCancelledError);
  });

  it('never lets a requested id reach the command line', async () => {
    const { calls, execute } = createExecutor((child) => child.emit('exit', 0, null));

    // The service validates ids first; this is defence in depth for the executor itself.
    const results = await execute(['not--in-manifest'], () => undefined, new AbortController().signal);

    expect(calls).toHaveLength(0);
    expect(results[0].status).toBe('failed');
    expect(results[0].error?.message).toContain('not in the generated manifest');
  });
});

describe('service announcement', () => {
  function createController(onSend: (body: unknown) => void, ok = true) {
    return new StoryController({
      baseUrl: 'http://127.0.0.1:7007',
      fetchImpl: (async (_url: string, init?: RequestInit) => {
        onSend(JSON.parse(String(init?.body ?? '{}')));
        return { ok, status: ok ? 200 : 503, json: async () => ({}) } as Response;
      }) as typeof fetch,
    });
  }

  it('broadcasts the endpoint over the Storybook channel', async () => {
    const sent: unknown[] = [];
    const announcer = startServiceAnnouncer({
      controller: createController((body) => sent.push(body)),
      announcement: createAnnouncement('http://127.0.0.1:7017', 'tok', 'deadbeef'),
    });

    await expect(announcer.announceNow()).resolves.toBe(true);
    announcer.stop();

    expect(sent).toEqual([
      {
        type: DESKTOP_SERVICE_ANNOUNCE_EVENT,
        args: [{ protocolVersion: 1, url: 'http://127.0.0.1:7017', token: 'tok', manifestDigest: 'deadbeef' }],
      },
    ]);
  });

  it('treats an unreachable channel as non-fatal', async () => {
    const announcer = startServiceAnnouncer({
      controller: createController(() => undefined, false),
      announcement: createAnnouncement('http://127.0.0.1:7017', 'tok', 'deadbeef'),
    });

    await expect(announcer.announceNow()).resolves.toBe(false);
    announcer.stop();
  });

  it('re-broadcasts on an interval so a late or reloaded app still discovers it', async () => {
    jest.useFakeTimers();
    try {
      const sent: unknown[] = [];
      const announcer = startServiceAnnouncer({
        controller: createController((body) => sent.push(body)),
        announcement: createAnnouncement('http://127.0.0.1:7017', 'tok', 'deadbeef'),
        intervalMs: 1000,
      });

      jest.advanceTimersByTime(3000);
      announcer.stop();
      jest.advanceTimersByTime(5000);

      // Three ticks fired; nothing further after stop().
      expect(sent.length).toBe(3);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('manifest loading', () => {
  it('rejects a missing manifest with an actionable message', () => {
    expect(() => loadStoryTestManifest(path.join(os.tmpdir(), 'definitely-missing.json'))).toThrow(/stories generate/);
  });

  it('rejects a manifest from a different schema version', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-manifest-')), 'm.json');
    fs.writeFileSync(file, JSON.stringify({ ...manifest, version: 99 }), 'utf8');

    expect(() => loadStoryTestManifest(file)).toThrow(DesktopValidationError);
  });

  it('loads a valid manifest', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-manifest-')), 'm.json');
    fs.writeFileSync(file, JSON.stringify(manifest), 'utf8');

    expect(loadStoryTestManifest(file).entries[0].storyId).toBe('components-button--default');
  });
});
