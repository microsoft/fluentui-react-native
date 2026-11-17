import type {
  DesktopIntegrationRequest,
  DesktopIntegrationWorkloadContext,
  ResolvedDesktopConfig,
  ResolvedDesktopTarget,
} from '@fluentui-react-native/desktop-test';

import { storybook } from './integration';

const mockCalls: { method: string; options: Record<string, unknown>; args: unknown[] }[] = [];

jest.mock('@fluentui-react-native/storybook-desktop/cli', () => ({
  DesktopStorybookCli: class {
    private readonly options: Record<string, unknown>;
    constructor(_config: unknown, options: Record<string, unknown>) {
      this.options = options;
    }
    async startDriver(...args: unknown[]) {
      mockCalls.push({ method: 'startDriver', options: this.options, args });
      return {
        targetId: 'target',
        // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- The integration fixture uses a fake loopback driver.
        url: 'http://127.0.0.1:1234',
        serviceReady: { tier: 'service-ready', service: 'storybook-channel', incarnation: 'fixture', processId: 1 },
      };
    }
    async prep(...args: unknown[]) {
      mockCalls.push({ method: 'prep', options: this.options, args });
    }
    async test(...args: unknown[]) {
      mockCalls.push({ method: 'test', options: this.options, args });
    }
    async testManaged(...args: unknown[]) {
      mockCalls.push({ method: 'testManaged', options: this.options, args });
    }
  },
}));

test('contributes the driver workload without taking over the supervisor lifecycle', async () => {
  const integration = storybook({ storyPackages: [] });
  const config = { projectRoot: __dirname } as ResolvedDesktopConfig;
  const target = { endpoint: 'win32', host: { renderer: 'paper' } } as ResolvedDesktopTarget;
  const supervisor = { reporter: {}, runner: {}, services: {} } as DesktopIntegrationWorkloadContext['supervisor'];
  const request = (action: DesktopIntegrationRequest['action']): DesktopIntegrationRequest => ({ config, target, action });
  const serve = integration.contribute!(request('serve'));
  const prep = integration.contribute!(request('prep'));
  const test = integration.contribute!(request('test'));
  expect(serve.driver?.kind).toBe('hosted');
  expect(serve.workload).toBeUndefined();
  expect(prep.driver).toBeUndefined();
  await serve.driver!.acquire({
    ...request('serve'),
    supervisor,
    agent: { descriptor: 'storybook.json' },
    input: 'accessible',
  });
  await serve.driver!.acquire({
    ...request('serve'),
    supervisor,
  });
  await prep.workload!({
    ...request('prep'),
    supervisor,
  });
  const connection = { url: 'fixture', client: {} } as Parameters<NonNullable<typeof serve.managedWorkload>>[0]['connection'];
  const addSecret = jest.fn();
  await serve.managedWorkload!({ supervisor, connection, input: 'accessible', workload: 'stories', storyId: 'button--default', addSecret });
  await test.attachedWorkload!({
    supervisor,
    workload: 'stories',
    input: 'accessible',
    descriptor: 'runner.json',
    root: 'private',
    preempt: true,
  });

  expect(mockCalls.map(({ method, options, args }) => [method, options.reporterMode, args])).toEqual([
    ['startDriver', undefined, ['win32', { agent: { descriptor: 'storybook.json' }, input: 'accessible' }]],
    ['startDriver', undefined, ['win32', {}]],
    ['prep', undefined, ['win32']],
    ['testManaged', undefined, ['win32', { connection, input: 'accessible', storyId: 'button--default', addSecret }]],
    ['test', undefined, ['win32', { attachAgent: true, input: 'accessible', descriptor: 'runner.json', root: 'private', preempt: true }]],
  ]);
});
