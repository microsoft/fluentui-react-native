import type { DesktopIntegration } from '@fluentui-react-native/desktop-test';

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

test('serve passes the agent connection and output format to the driver; other actions do not', async () => {
  const integration = storybook({ storyPackages: [] });
  const supervisor = { reporter: {}, runner: {}, services: {} };
  const run = (context: Partial<Parameters<NonNullable<DesktopIntegration['run']>>[0]>) =>
    integration.run!({
      config: { projectRoot: __dirname },
      target: { endpoint: 'win32', host: { renderer: 'paper' } },
      supervisor,
      ...context,
    } as Parameters<NonNullable<DesktopIntegration['run']>>[0]);

  await run({ action: 'serve', agent: { descriptor: 'storybook.json' }, reporterMode: 'json' });
  await run({ action: 'serve', reporterMode: 'plain' });
  await run({ action: 'prep', reporterMode: 'json' });

  expect(mockCalls.map(({ method, options, args }) => [method, options.reporterMode, args])).toEqual([
    ['driver', 'json', ['win32', { agent: { descriptor: 'storybook.json' } }]],
    ['driver', 'plain', ['win32', {}]],
    ['prep', undefined, ['win32']],
  ]);
});
