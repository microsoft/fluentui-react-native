import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { resolveDesktopScopeDomains } from '@fluentui-react-native/desktop-driver/authoring';

import { validateDesktopConfig } from './config.js';
import type { DesktopConfig, ResolvedDesktopConfig, ResolvedDesktopTarget } from './config.js';
import { createManagedDesktopWdioService } from './managedWdio.js';

jest.mock('./wdio/run.js', () => ({ runDesktopWdioSuite: jest.fn() }));

const target: ResolvedDesktopTarget = {
  endpoint: 'macos',
  id: 'target',
  registrationId: 'target',
  instanceId: 'instance',
  projectRoot: '/fixture',
  configPath: '/fixture/desktop.config.mts',
  host: { kind: 'installed', ownership: 'external', application: { bundleIdentifier: 'fixture', windowTitle: 'Fixture' } },
};

const wdio = { kind: 'wdio', framework: 'jasmine', specs: ['fixture.test.ts'] } as const;
const config: DesktopConfig = {
  schemaVersion: 1,
  targets: { macos: { host: target.host } },
  integration: { name: 'fixture', validate: () => undefined },
  suites: {
    both: { ...wdio, agent: { lanes: ['accessible', 'physical'] } },
    accessible: { ...wdio, agent: { lanes: ['accessible'] } },
    private: wdio,
    stories: { kind: 'csf-wdio', agent: { lanes: ['accessible', 'physical'] } },
  },
};
const resolved: ResolvedDesktopConfig = {
  config,
  configPath: target.configPath,
  projectRoot: target.projectRoot,
  targets: { macos: target },
  reporting: { artifactsRoot: '/fixture/artifacts' },
  testScopes: resolveDesktopScopeDomains(),
};

describe('managed desktop workload configuration', () => {
  test('accepts explicit Jasmine and CSF lanes without exposing undeclared suites', () => {
    expect(() => validateDesktopConfig(config)).not.toThrow();
  });

  test.each([
    ['invalid ID', 'bad/id', { lanes: ['physical'] }, 'jasmine'],
    ['empty lanes', 'suite', { lanes: [] }, 'jasmine'],
    ['duplicate lanes', 'suite', { lanes: ['physical', 'physical'] }, 'jasmine'],
    ['unknown lane', 'suite', { lanes: ['other'] }, 'jasmine'],
    ['extra field', 'suite', { lanes: ['physical'], command: 'arbitrary' }, 'jasmine'],
    ['non-Jasmine', 'suite', { lanes: ['physical'] }, 'mocha'],
  ])('rejects %s', (_description, id, agent, framework) => {
    expect(() =>
      validateDesktopConfig({
        schemaVersion: 1,
        targets: { macos: { host: target.host } },
        suites: { [id]: { ...wdio, framework, agent } },
      }),
    ).toThrow();
  });

  test.each([
    [
      'physical',
      [
        { id: 'both', lanes: ['physical'] },
        { id: 'accessible', lanes: [], unavailable: 'host-input' },
      ],
    ],
    [
      'accessible',
      [
        { id: 'both', lanes: ['accessible'] },
        { id: 'accessible', lanes: ['accessible'] },
      ],
    ],
  ] as const)('limits the catalog to the live %s host mask', async (hostLane, expected) => {
    const host = new AbortController();
    const connectRunner = jest.fn(async () => {
      throw new Error('Catalog reads must not acquire a runner.');
    });
    const service = createManagedDesktopWdioService({ config: resolved, target, hostSignal: host.signal, hostLane, connectRunner });
    const principal = service.connect(service.credential);
    try {
      const response = await service.request(principal, { action: 'catalog' });
      expect(response).toMatchObject({
        catalog: [
          ...expected.map((entry) => ({ ...entry, kind: 'wdio' })),
          { id: 'stories', kind: 'csf-wdio', lanes: [], unavailable: 'runner-unavailable' },
        ],
      });
      if (hostLane === 'accessible') {
        await expect(
          service.request(principal, {
            action: 'run',
            workload: 'both',
            lane: 'physical',
            requestId: 'wrong-host-mask',
          }),
        ).rejects.toMatchObject({ code: 'unavailable' });
      } else {
        await expect(
          service.request(principal, {
            action: 'run',
            workload: 'both',
            lane: 'accessible',
            requestId: 'unmasked-generic-host',
          }),
        ).rejects.toMatchObject({ code: 'unavailable' });
      }
      await expect(
        service.request(principal, { action: 'run', workload: 'private', lane: hostLane, requestId: 'not-opted-in' }),
      ).rejects.toMatchObject({ code: 'unavailable' });
      expect(connectRunner).not.toHaveBeenCalled();
      expect(host.signal.aborted).toBe(false);
    } finally {
      await service.close();
    }
  });

  test.each(['session', undefined] as const)('does not offer attach-only workloads for %s ownership', async (ownership) => {
    const service = createManagedDesktopWdioService({
      config: resolved,
      target: { ...target, host: { ...target.host, ownership } },
      hostSignal: new AbortController().signal,
      hostLane: 'physical',
      connectRunner: async () => {
        throw new Error('Unexpected runner connection.');
      },
    });
    try {
      const principal = service.connect(service.credential);
      expect(await service.request(principal, { action: 'catalog' })).toMatchObject({
        catalog: expect.arrayContaining([{ id: 'both', kind: 'wdio', lanes: [], unavailable: 'runner-unavailable' }]),
      });
    } finally {
      await service.close();
    }
  });

  test('runs an opted-in story suite in an independent scope against the hosted runner', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'managed-story-workload-'));
    const host = new AbortController();
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- The test uses a fake loopback connection.
    const connection = { url: 'http://127.0.0.1:1234', client: {} } as Parameters<
      NonNullable<Parameters<typeof createManagedDesktopWdioService>[0]['managedWorkload']>
    >[0]['connection'];
    const addSecret = jest.fn();
    const connectRunner = jest.fn(async (redact: (secret: string) => void) => {
      redact('managed-runner-secret');
      return connection;
    });
    const managedWorkload = jest.fn(async ({ supervisor }) => {
      supervisor.reporter.emit({
        kind: 'test-result',
        payload: { testId: 'story', title: 'Story', attempt: 0, status: 'passed', durationMs: 1 },
      });
    });
    const service = createManagedDesktopWdioService({
      config: { ...resolved, reporting: { artifactsRoot: root } },
      target: { ...target, host: { ...target.host, ownership: 'session' } },
      hostSignal: host.signal,
      hostLane: 'physical',
      connectRunner,
      managedWorkload,
      addSecret,
    });
    try {
      const principal = service.connect(service.credential);
      expect(await service.request(principal, { action: 'catalog' })).toMatchObject({
        catalog: expect.arrayContaining([{ id: 'stories', kind: 'csf-wdio', lanes: ['accessible', 'physical'] }]),
      });
      const admitted = await service.request(principal, {
        action: 'run',
        workload: 'stories',
        lane: 'physical',
        storyId: 'button--default',
        requestId: 'managed-story',
      });
      if (!('run' in admitted) || !admitted.run) throw new Error('Expected story admission.');
      let current = admitted.run;
      for (let index = 0; index < 100 && current.phase !== 'settled'; index++) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        const status = await service.request(principal, { action: 'status', handle: admitted.run.handle });
        if (!('run' in status) || !status.run) throw new Error('Expected story status.');
        current = status.run;
      }
      expect(current).toMatchObject({ outcome: 'passed', cleanup: 'settled', storyId: 'button--default' });
      expect(managedWorkload).toHaveBeenCalledWith(
        expect.objectContaining({ workload: 'stories', input: 'physical', storyId: 'button--default', connection }),
      );
      expect(addSecret).toHaveBeenCalledWith('managed-runner-secret');
      expect(host.signal.aborted).toBe(false);
    } finally {
      await service.close();
      fs.rmSync(root, { force: true, recursive: true });
    }
  });
});
