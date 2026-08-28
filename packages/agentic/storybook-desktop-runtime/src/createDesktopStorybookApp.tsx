import type * as React from 'react';
import { StyleSheet, View as NativeView } from 'react-native';
import type { View } from '@storybook/react-native';

import { DesktopDriverBridge } from './DesktopDriverBridge';
import { DesktopStorybookConfigProvider, useDesktopStorybookTestID } from './DesktopStorybookConfig';
import type { DesktopStorybookRuntimeInstance } from './DesktopStorybookConfig';
import { StorybookThemeHost } from './StorybookTheme';
import { StorybookUIComponent } from './StorybookUI';

export type DesktopStorybookOptions = {
  enableWebsockets?: boolean;
  host?: string;
  port?: number;
  testIDPrefix?: string;
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
    const resolvedTestIDPrefix = runtimeInstance?.testIDPrefix ?? testIDPrefix;
    return (
      <DesktopStorybookConfigProvider runtimeInstance={runtimeInstance} testIDPrefix={resolvedTestIDPrefix}>
        <DesktopStorybookAppRoot>
          <DesktopDriverBridge />
          <StorybookThemeHost>
            <StorybookUI />
          </StorybookThemeHost>
        </DesktopStorybookAppRoot>
      </DesktopStorybookConfigProvider>
    );
  }

  return DesktopStorybookApp;
}

function DesktopStorybookAppRoot({ children }: React.PropsWithChildren) {
  const testID = useDesktopStorybookTestID('app-root');
  return (
    <NativeView style={styles.root} testID={testID}>
      {children}
    </NativeView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
