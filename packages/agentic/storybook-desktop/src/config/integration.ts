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
    async run({ config, target, supervisor, action }) {
      const { DesktopStorybookCli } = await import('@fluentui-react-native/storybook-desktop/cli');
      const api = new DesktopStorybookCli(this.configure(config.projectRoot, config), {
        paper: target.endpoint === 'macos' && target.host.renderer === 'paper',
        reporter: supervisor.reporter,
        runner: supervisor.runner,
        services: supervisor.services,
      });
      if (action === 'serve') await api.driver(target.endpoint);
      else if (action === 'test') await api.smoke(target.endpoint, { mode: 'stories-and-tests' });
      else await api[action](target.endpoint);
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
