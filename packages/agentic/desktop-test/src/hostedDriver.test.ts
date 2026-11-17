import type { DesktopCommandRunner } from './commands.js';
import type { ResolvedDesktopConfig, ResolvedDesktopTarget } from './config.js';
import { acquireHostedDesktopDriver, formatDesktopHostReady } from './hostedDriver.js';
import type { DesktopHostedDriverReady, DesktopIntegrationRequest } from './integration.js';
import { createManagedDesktopHostResource } from './managedHost.js';
import { DesktopServiceScope } from './services.js';
import type { DesktopSupervisor } from './supervisor.js';

jest.mock('./managedHost.js', () => ({ createManagedDesktopHostResource: jest.fn() }));

const target: ResolvedDesktopTarget = {
  endpoint: 'macos',
  id: 'real-target',
  registrationId: 'target',
  instanceId: 'instance',
  projectRoot: '/fixture',
  configPath: '/fixture/desktop.config.mts',
  host: { kind: 'installed', ownership: 'external', renderer: 'fabric' },
};

const config = {} as ResolvedDesktopConfig;
const agent = { descriptor: 'agent.json', runner: { descriptor: 'runner.json' } };
const request: DesktopIntegrationRequest = { config, target, action: 'serve', input: 'accessible', agent };
// eslint-disable-next-line @microsoft/sdl/no-insecure-url -- Driver fixtures bind loopback only.
const driverUrl = 'http://127.0.0.1:1234';
const ready: DesktopHostedDriverReady = {
  targetId: target.id,
  url: driverUrl,
  agentDescriptor: 'agent.json',
  runnerDescriptor: 'runner.json',
  serviceReady: { tier: 'service-ready', service: 'channel', descriptor: 'agent.json', incarnation: 'process', processId: 1 },
  integration: { name: 'fixture', details: { targetId: 'not-the-supervisor-target' } },
};

function owner() {
  const runner = { run: jest.fn(), start: jest.fn() } as unknown as DesktopCommandRunner;
  const services = new DesktopServiceScope(runner);
  const supervisor = {
    target,
    services,
    reporter: { runId: 'run', addSecret: jest.fn() },
  } as unknown as DesktopSupervisor;
  return { services, supervisor };
}

describe('hosted desktop driver ownership', () => {
  beforeEach(() => jest.clearAllMocks());

  test('announces canonical readiness only after management, and disposes management before the driver', async () => {
    const { services, supervisor } = owner();
    const events: string[] = [];
    let release!: () => void;
    let entered!: () => void;
    const pending = new Promise<void>((resolve) => (release = resolve));
    const managementStarted = new Promise<void>((resolve) => (entered = resolve));
    let published = false;
    jest.mocked(createManagedDesktopHostResource).mockImplementation((options) => {
      expect(options).toMatchObject({
        hostLane: 'accessible',
        driver: { record: 'agent.json', runnerRecord: 'runner.json', url: ready.url },
      });
      return {
        get descriptor() {
          return published ? 'supervisor.json' : undefined;
        },
        resource: {
          id: 'workload-management',
          ownership: 'owned',
          prepare: () => ({
            identity: 'management',
            acquire: async () => {
              events.push('management-start');
              entered();
              await pending;
              published = true;
            },
            dispose: async () => {
              events.push('management-stop');
            },
          }),
        },
      };
    });
    const running = acquireHostedDesktopDriver({
      supervisor,
      request,
      driver: {
        kind: 'hosted',
        acquire: async () => {
          await services.contribute(
            [
              {
                id: 'channel',
                ownership: 'owned',
                prepare: () => ({
                  identity: 'channel',
                  acquire: async () => {
                    events.push('driver-start');
                  },
                  dispose: async () => {
                    events.push('driver-stop');
                  },
                }),
              },
            ],
            { targetId: target.id, targetInstanceId: target.instanceId },
          );
          return ready;
        },
      },
    });
    await managementStarted;
    let announced = false;
    void running.then(() => (announced = true));
    await Promise.resolve();
    expect(announced).toBe(false);
    release();
    const result = await running;
    expect(result).toMatchObject({
      type: 'ready',
      targetId: 'real-target',
      instanceId: 'instance',
      runId: 'run',
      supervisorDescriptor: 'supervisor.json',
      integration: { name: 'fixture', details: { targetId: 'not-the-supervisor-target' } },
    });
    expect(JSON.parse(formatDesktopHostReady('json', result))).toEqual(result);
    await services.close();
    expect(events).toEqual(['driver-start', 'management-start', 'management-stop', 'driver-stop']);
  });

  test.each([
    ['target', { targetId: 'other-target' }],
    ['agent descriptor', { agentDescriptor: 'other.json' }],
    ['runner descriptor', { runnerDescriptor: 'other.json' }],
    ['private root', { root: '/unexpected' }],
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- This invalid URL is rejected before use.
    ['non-loopback URL', { url: 'http://example.invalid:1234' }],
    ['receipt descriptor', { serviceReady: { ...ready.serviceReady, descriptor: 'other.json' } }],
    ['missing receipt', { serviceReady: undefined }],
  ])('refuses a mismatched %s before management publication', async (_name, mismatch) => {
    const { services, supervisor } = owner();
    try {
      await expect(
        acquireHostedDesktopDriver({
          supervisor,
          request,
          driver: { kind: 'hosted', acquire: async () => ({ ...ready, ...mismatch }) as DesktopHostedDriverReady },
        }),
      ).rejects.toThrow();
      expect(createManagedDesktopHostResource).not.toHaveBeenCalled();
    } finally {
      await services.close();
    }
  });

  test('does not announce readiness after management publication fails', async () => {
    const { services, supervisor } = owner();
    const stopped = jest.fn();
    jest.mocked(createManagedDesktopHostResource).mockReturnValue({
      descriptor: undefined,
      resource: {
        id: 'workload-management',
        ownership: 'owned',
        prepare: () => ({
          identity: 'management',
          acquire: async () => {
            throw new Error('Verification failed.');
          },
          dispose: async () => undefined,
        }),
      },
    });
    try {
      await expect(
        acquireHostedDesktopDriver({
          supervisor,
          request,
          driver: {
            kind: 'hosted',
            acquire: async () => {
              await services.contribute(
                [
                  {
                    id: 'channel',
                    ownership: 'owned',
                    prepare: () => ({
                      identity: 'channel',
                      acquire: async () => undefined,
                      dispose: async () => stopped(),
                    }),
                  },
                ],
                { targetId: target.id, targetInstanceId: target.instanceId },
              );
              return ready;
            },
          },
        }),
      ).rejects.toThrow('Verification failed.');
    } finally {
      await services.close();
    }
    expect(stopped).toHaveBeenCalledTimes(1);
  });
});
