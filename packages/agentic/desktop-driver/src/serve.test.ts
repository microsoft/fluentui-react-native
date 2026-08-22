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
import {
  DESKTOP_HOST_READY_EVENT,
  DESKTOP_RUN_REQUEST_EVENT,
  DESKTOP_RUN_STATUS_EVENT,
  startDesktopChannelBridge,
  type ChannelServerLike,
  type ChannelSocketLike,
} from './storybook/channel-service.ts';
import { loadStoryTestManifest, startDesktopStorybookHost } from './storybook/serve.ts';
import { digestEntries } from './storybook/manifest.ts';
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

describe('Storybook channel run transport', () => {
  it('announces readiness and carries run status without exposing the hidden service', async () => {
    const channel = new FakeChannel();
    const requests: string[] = [];
    let statusReads = 0;
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      requests.push(`${init?.method ?? 'GET'} ${url}`);
      const status =
        init?.method === 'POST'
          ? {
              runId: 'run-1',
              protocolVersion: 1,
              state: 'running',
              requestedStoryIds: ['components-button--default'],
              results: [],
            }
          : {
              runId: 'run-1',
              protocolVersion: 1,
              state: ++statusReads > 0 ? 'passed' : 'running',
              requestedStoryIds: ['components-button--default'],
              results: [],
            };
      return { ok: true, status: 200, json: async () => status } as Response;
    }) as typeof fetch;

    const bridge = startDesktopChannelBridge({
      channel,
      serviceUrl: 'http://127.0.0.1:49123',
      token: 'hidden-token',
      manifestDigest: 'deadbeef',
      serviceId: 'service-1',
      pollIntervalMs: 1,
      fetchImpl,
    });
    const socket = new FakeSocket();
    channel.connect(socket);

    const ready = JSON.parse(socket.sent[0]) as { type: string; args: [{ serviceId: string; manifestDigest: string }] };
    expect(ready).toEqual({
      type: DESKTOP_HOST_READY_EVENT,
      args: [{ protocolVersion: 1, serviceId: 'service-1', manifestDigest: 'deadbeef' }],
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
            mode: 'selected',
            storyIds: ['components-button--default'],
          },
        ],
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    bridge.stop();

    const events = socket.sent.map((message) => JSON.parse(message) as { type: string; args: [{ status?: { state: string } }] });
    expect(events.filter((event) => event.type === DESKTOP_RUN_STATUS_EVENT).map((event) => event.args[0].status?.state)).toEqual([
      'running',
      'passed',
    ]);
    expect(requests).toEqual(['POST http://127.0.0.1:49123/v1/runs', 'GET http://127.0.0.1:49123/v1/runs/run-1']);
    expect(socket.sent.join('')).not.toContain('hidden-token');
    expect(socket.sent.join('')).not.toContain('49123');
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
