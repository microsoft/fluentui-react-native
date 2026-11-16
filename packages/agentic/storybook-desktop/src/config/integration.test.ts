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
    async driver(...args: unknown[]) {
      mockCalls.push({ method: 'driver', options: this.options, args });
    }
    async prep(...args: unknown[]) {
      mockCalls.push({ method: 'prep', options: this.options, args });
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
  expect(serve.driver).toEqual({ kind: 'hosted' });
  expect(prep.driver).toBeUndefined();
  await serve.workload!({
    ...request('serve'),
    supervisor,
    agent: { descriptor: 'storybook.json' },
    reporterMode: 'json',
    onReady: jest.fn(),
  });
  await serve.workload!({
    ...request('serve'),
    supervisor,
    reporterMode: 'plain',
  });
  await prep.workload!({
    ...request('prep'),
    supervisor,
    reporterMode: 'json',
  });

  expect(mockCalls.map(({ method, options, args }) => [method, options.reporterMode, args])).toEqual([
    ['driver', 'json', ['win32', { agent: { descriptor: 'storybook.json' } }]],
    ['driver', 'plain', ['win32', {}]],
    ['prep', undefined, ['win32']],
  ]);
});
