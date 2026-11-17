import type { DesktopIntegration, ResolvedDesktopConfig } from '@fluentui-react-native/desktop-test';
import type { DesktopConfig } from '@fluentui-react-native/desktop-test/config';
import { DesktopStorybookConfig } from './makeDesktopStorybookConfig.ts';
import type { DesktopStorybookConfigOptions } from './makeDesktopStorybookConfig.ts';

export type StorybookDesktopIntegration = DesktopIntegration & {
  configure(projectRoot: string | URL, desktop?: ResolvedDesktopConfig): DesktopStorybookConfig;
};

export function storybook(options: DesktopStorybookConfigOptions = {}): StorybookDesktopIntegration {
  return {
    name: 'storybook',
    validate() {
      const allowed = [
        'projectRoot',
        'storybookConfigDir',
        'appConfigPath',
        'storyPackages',
        'deviceAddons',
        'testIDPrefix',
        'platformOptions',
        'wdio',
        'platforms',
        'storyPatterns',
        'platformSettings',
      ];
      for (const key of Object.keys(options))
        if (!allowed.includes(key)) throw new TypeError(`Unknown Storybook integration field "${key}".`);
      new DesktopStorybookConfig(options);
    },
    configure(projectRoot, desktop) {
      return new DesktopStorybookConfig({ ...options, projectRoot }, desktop);
    },
    contribute({ config, target, action }) {
      return {
        ...(action === 'serve'
          ? {
              driver: {
                kind: 'hosted' as const,
                acquire: async ({ supervisor, agent, input }) => {
                  const { DesktopStorybookCli } = await import('@fluentui-react-native/storybook-desktop/cli');
                  const api = new DesktopStorybookCli(this.configure(config.projectRoot, config), {
                    paper: target.endpoint === 'macos' && target.host.renderer === 'paper',
                    reporter: supervisor.reporter,
                    runner: supervisor.runner,
                    services: supervisor.services,
                    supervisor,
                  });
                  return api.startDriver(target.endpoint, { ...(agent ? { agent } : {}), ...(input ? { input } : {}) });
                },
              },
              managedWorkload: async ({ supervisor, connection, input, storyId, addSecret }) => {
                const { DesktopStorybookCli } = await import('@fluentui-react-native/storybook-desktop/cli');
                const api = new DesktopStorybookCli(this.configure(config.projectRoot, config), {
                  paper: target.endpoint === 'macos' && target.host.renderer === 'paper',
                  reporter: supervisor.reporter,
                  runner: supervisor.runner,
                  services: supervisor.services,
                });
                await api.testManaged(target.endpoint, { connection, input, storyId, addSecret });
              },
            }
          : {
              workload: async ({ supervisor, input }) => {
                const { DesktopStorybookCli } = await import('@fluentui-react-native/storybook-desktop/cli');
                const api = new DesktopStorybookCli(this.configure(config.projectRoot, config), {
                  paper: target.endpoint === 'macos' && target.host.renderer === 'paper',
                  reporter: supervisor.reporter,
                  runner: supervisor.runner,
                  services: supervisor.services,
                });
                if (action === 'test') await api.smoke(target.endpoint, { mode: 'stories-and-tests', ...(input ? { input } : {}) });
                else await api[action](target.endpoint);
              },
            }),
        ...(action === 'test'
          ? {
              attachedWorkload: async ({ supervisor, input, descriptor, root, preempt }) => {
                const { DesktopStorybookCli } = await import('@fluentui-react-native/storybook-desktop/cli');
                const api = new DesktopStorybookCli(this.configure(config.projectRoot, config), {
                  paper: target.endpoint === 'macos' && target.host.renderer === 'paper',
                  reporter: supervisor.reporter,
                  runner: supervisor.runner,
                  services: supervisor.services,
                });
                await api.test(target.endpoint, { attachAgent: true, input, descriptor, root, preempt });
              },
            }
          : {}),
      };
    },
  };
}

export function getStorybookIntegration(config: DesktopConfig): StorybookDesktopIntegration {
  const integration = config.integration;
  if (!integration || integration.name !== 'storybook' || !('configure' in integration) || typeof integration.configure !== 'function') {
    throw new TypeError('Desktop config must explicitly import the Storybook integration.');
  }
  return integration as StorybookDesktopIntegration;
}
