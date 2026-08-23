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

import { buildInvocation, createWebdriverIoRunExecutor, resolveRunnerCommand } from './server/runner/wdio-runner.ts';
import { RunCoordinator } from './server/coordinator.ts';
import { encodeDesktopResult } from './server/runner/reporter-protocol.ts';
import {
  DESKTOP_HOST_READY_EVENT,
  DESKTOP_RUN_REQUEST_EVENT,
  DESKTOP_RUN_STATUS_EVENT,
  startDesktopChannelBridge,
  type ChannelServerLike,
  type ChannelSocketLike,
} from './server/channel/bridge.ts';
import { loadStoryTestManifest, startDesktopStorybookHost } from './server/host.ts';
import { digestEntries } from './storybook/manifest.ts';
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
manifest.digest = digestEntries(manifest.entries);

const runner = { command: 'yarn', args: ['wdio', 'run', 'wdio.conf.ts'], cwd: '/repo' };

/** Minimal ChildProcess double with the streams and events the executor listens to. */
class FakeChild extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  killed = false;
  pid = 42;
  kill(): boolean {
    this.killed = true;
    return true;
  }
}

class FakeSocket extends EventEmitter implements ChannelSocketLike {
  readonly sent: string[] = [];
  send(data: string): void {
    this.sent.push(data);
  }
}

class FakeChannel extends EventEmitter implements ChannelServerLike {
  readonly clients = new Set<FakeSocket>();
  connect(socket: FakeSocket): void {
    this.clients.add(socket);
    this.emit('connection', socket);
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

  it('resolves a Windows launcher through PATH and PATHEXT before falling back', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-runner-'));
    const launcher = path.join(root, 'custom.CMD');
    fs.writeFileSync(launcher, '', 'utf8');

    expect(resolveRunnerCommand('custom', 'win32', { PATH: root, PATHEXT: '.EXE;.CMD' }).toLowerCase()).toBe(launcher.toLowerCase());
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
  function createExecutor(
    behaviour: (child: FakeChild) => void,
    platform: NodeJS.Platform = 'darwin',
    terminateProcess?: () => Promise<void>,
  ) {
    const calls: { command: string; args: readonly string[]; options?: { windowsVerbatimArguments?: boolean } }[] = [];
    const spawnImpl = ((command: string, args: readonly string[], options?: { windowsVerbatimArguments?: boolean }) => {
      calls.push({ command, args, options });
      const child = new FakeChild();
      setTimeout(() => behaviour(child), 0);
      return child as never;
    }) as never;

    // The platform is pinned so the assertions below describe the executor, not the host.
    return { calls, execute: createWebdriverIoRunExecutor({ manifest, runner, spawnImpl, platform, terminateProcess }) };
  }

  it('passes a story when the runner exits zero', async () => {
    const { calls, execute } = createExecutor((child) => child.emit('exit', 0, null));
    const progress: string[] = [];

    const results = await execute(['components-button--default'], (result) => progress.push(result.status), new AbortController().signal);

    expect(results[0].status).toBe('passed');
    expect(progress).toEqual(['passed']);
    expect(calls[0].args).toContain('--spec');
  });

  it('streams framework results before the runner exits', async () => {
    let child: FakeChild | undefined;
    const { execute } = createExecutor((spawned) => {
      child = spawned;
    });
    const progress: string[] = [];
    const running = execute(['components-button--default'], (result) => progress.push(result.status), new AbortController().signal);
    await new Promise((resolve) => setTimeout(resolve, 1));
    child?.stdout.emit(
      'data',
      Buffer.from(
        `[0-0] ${encodeDesktopResult({
          testId: 'button',
          storyId: 'components-button--default',
          title: 'button',
          status: 'passed',
          durationMs: 1,
        })}\n`,
      ),
    );

    expect(progress).toEqual(['passed']);
    child?.emit('exit', 0, null);
    await expect(running).resolves.toEqual([expect.objectContaining({ testId: 'button', status: 'passed' })]);
    expect(progress).toEqual(['passed']);
  });

  it('runs multiple selected stories in one warm invocation', async () => {
    const second = {
      ...manifest.entries[0],
      storyId: 'components-button--interaction',
      tag: '[story:components-button--interaction]',
      grep: '\\[story:components-button--interaction\\]',
      plan: { kind: 'inline' as const, id: 'button-interaction', steps: [{ action: 'wait' as const, milliseconds: 1 }] },
    };
    const multiManifest = { ...manifest, entries: [manifest.entries[0], second] };
    const calls: { args: readonly string[]; env?: NodeJS.ProcessEnv }[] = [];
    const spawnImpl = ((_command: string, args: readonly string[], options?: { env?: NodeJS.ProcessEnv }) => {
      calls.push({ args, env: options?.env });
      const child = new FakeChild();
      setTimeout(() => child.emit('exit', 0, null), 0);
      return child as never;
    }) as never;
    const execute = createWebdriverIoRunExecutor({
      manifest: multiManifest,
      runner,
      spawnImpl,
      platform: 'darwin',
    });
    const progress: string[] = [];

    const results = await execute(
      multiManifest.entries.map((entry) => entry.storyId),
      (result) => progress.push(result.storyId ?? ''),
      new AbortController().signal,
    );

    expect(calls).toHaveLength(1);
    expect(calls[0].args.filter((argument) => argument === '--spec')).toHaveLength(1);
    expect(calls[0].env?.DESKTOP_TEST_GREP).toBe('(?:\\[story:components-button--default\\]|\\[story:components-button--interaction\\])');
    expect(results).toEqual([
      expect.objectContaining({
        testId: 'desktop-run',
        title: '2 selected desktop stories',
        status: 'passed',
      }),
    ]);
    expect(progress).toEqual(['']);
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

    expect(results[0].status).toBe('infrastructureError');
    expect(results[0].error?.message).toContain('code 1');
  });

  it('reports a spawn failure instead of leaving the run hanging', async () => {
    const { execute } = createExecutor((child) => child.emit('error', new Error('spawn ENOENT')));

    const results = await execute(['components-button--default'], () => undefined, new AbortController().signal);

    expect(results[0].status).toBe('infrastructureError');
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

  it('awaits process-tree termination when cancelled during a run', async () => {
    let child: FakeChild | undefined;
    let finishTermination: (() => void) | undefined;
    const terminateProcess = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finishTermination = resolve;
        }),
    );
    const executor = createExecutor(
      (spawned) => {
        child = spawned;
      },
      'win32',
      terminateProcess,
    );
    const controller = new AbortController();
    const running = executor.execute(['components-button--default'], () => undefined, controller.signal);
    await new Promise((resolve) => setTimeout(resolve, 1));
    controller.abort();
    child?.emit('exit', null, 'SIGTERM');

    let settled = false;
    void running.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 1));
    expect(settled).toBe(false);
    finishTermination?.();

    await expect(running).rejects.toBeInstanceOf(DesktopCancelledError);
    expect(terminateProcess).toHaveBeenCalledWith(expect.objectContaining({ pid: 42, platform: 'win32', processGroup: false }));
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

describe('Storybook channel run transport', () => {
  it('announces readiness and carries run status without exposing the hidden service', async () => {
    const channel = new FakeChannel();
    const coordinator = new RunCoordinator({
      manifest,
      execute: async (storyIds, progress) => {
        const results = storyIds.map((storyId) => ({
          testId: storyId,
          storyId,
          title: storyId,
          status: 'passed' as const,
          durationMs: 1,
        }));
        results.forEach(progress);
        return results;
      },
    });

    const bridge = startDesktopChannelBridge({
      channel,
      coordinator,
      manifest,
      serviceId: 'service-1',
    });
    const socket = new FakeSocket();
    channel.connect(socket);

    const ready = JSON.parse(socket.sent[0]) as { type: string; args: [{ serviceId: string; manifest: { digest: string } }] };
    expect(ready).toEqual({
      type: DESKTOP_HOST_READY_EVENT,
      args: [
        {
          protocolVersion: 1,
          serviceId: 'service-1',
          manifest: {
            schemaVersion: 1,
            digest: manifest.digest,
            tests: [
              {
                storyId: 'components-button--default',
                planId: 'button-default',
                kind: 'inline',
              },
            ],
          },
          capabilities: {
            runModes: ['selected', 'all'],
            cancellation: true,
            maxConcurrentRuns: 1,
          },
        },
      ],
    });

    socket.emit(
      'message',
      JSON.stringify({
        type: DESKTOP_RUN_REQUEST_EVENT,
        args: [
          {
            protocolVersion: 1,
            serviceId: 'service-1',
            requestId: 'request-1',
            manifestDigest: manifest.digest,
            mode: 'selected',
            storyIds: ['components-button--default'],
          },
        ],
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    bridge.stop();
    await coordinator.stop();

    const events = socket.sent.map(
      (message) => JSON.parse(message) as { type: string; args: [{ sequence?: number; status?: { state: string } }] },
    );
    const statuses = events.filter((event) => event.type === DESKTOP_RUN_STATUS_EVENT);
    expect(statuses.map((event) => event.args[0].status?.state)).toEqual(['running', 'running', 'passed']);
    expect(statuses.map((event) => event.args[0].sequence)).toEqual([1, 2, 3]);
    expect(socket.sent.join('')).not.toContain('token');
    expect(socket.sent.join('')).not.toContain('/v1/runs');
  });
});

describe('manifest loading', () => {
  it('rejects a missing manifest with an actionable message', () => {
    expect(() => loadStoryTestManifest(path.join(os.tmpdir(), 'definitely-missing.json'))).toThrow(/stories generate/);
  });

  describe('combined desktop host validation', () => {
    it('rejects a non-loopback host before loading or binding Storybook', async () => {
      const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-host-')), 'manifest.json');
      fs.writeFileSync(file, JSON.stringify(manifest), 'utf8');

      await expect(
        startDesktopStorybookHost({
          configPath: path.dirname(file),
          manifestPath: file,
          host: '0.0.0.0',
          runner,
        }),
      ).rejects.toThrow(/non-loopback/);
    });
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
