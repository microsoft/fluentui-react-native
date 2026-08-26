import type { View } from '@storybook/react-native';

import { DesktopStorybookConfigProvider } from './DesktopStorybookConfig';
import { StorybookThemeHost } from './StorybookTheme';
import { StorybookUIComponent } from './StorybookUI';

export type DesktopStorybookOptions = {
  enableWebsockets?: boolean;
  host?: string;
  port?: number;
  testIDPrefix?: string;
};

type DesktopStorybookRuntimeInstance = {
  storybookPort?: number;
};

export function createDesktopStorybookApp(
  view: Pick<View, 'getStorybookUI'>,
  { enableWebsockets = true, host = '127.0.0.1', port, testIDPrefix = 'storybook-desktop' }: DesktopStorybookOptions = {},
) {
  const runtimeInstance = (
    globalThis as typeof globalThis & {
      __FURN_DESKTOP_STORYBOOK_INSTANCE__?: DesktopStorybookRuntimeInstance;
    }
  ).__FURN_DESKTOP_STORYBOOK_INSTANCE__;
  const memoryStore: Record<string, string> = {};
  const storage = {
    getItem: async (key: string) => (key in memoryStore ? memoryStore[key] : null),
    setItem: async (key: string, value: string) => {
      memoryStore[key] = value;
    },
  };
  const StorybookUI = view.getStorybookUI({
    enableWebsockets,
    host,
    port: port ?? runtimeInstance?.storybookPort ?? 7007,
    CustomUIComponent: StorybookUIComponent,
    storage,
  });

  function DesktopStorybookApp() {
    return (
      <DesktopStorybookConfigProvider testIDPrefix={testIDPrefix}>
        <StorybookThemeHost>
          <StorybookUI />
        </StorybookThemeHost>
      </DesktopStorybookConfigProvider>
    );
  }

  return DesktopStorybookApp;
}
