import * as React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { createDesktopStorybookApp } from './createDesktopStorybookApp';
import { useDesktopStorybookConfig, type DesktopStorybookRuntimeInstance } from './DesktopStorybookConfig';

let mockRuntimeInstance: DesktopStorybookRuntimeInstance;
jest.mock('../config/runtime-instance.cjs', () => ({
  __esModule: true,
  get default() {
    return mockRuntimeInstance;
  },
}));
jest.mock('./DesktopDriverBridge', () => ({ DesktopDriverBridge: () => null }));
jest.mock('./StorybookTheme', () => ({ StorybookThemeHost: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('./ThemedStorybookUI', () => ({ ThemedStorybookUI: () => null }));

const globals = globalThis as typeof globalThis & { __FURN_DESKTOP_STORYBOOK_INSTANCE__?: DesktopStorybookRuntimeInstance };
const original = globals.__FURN_DESKTOP_STORYBOOK_INSTANCE__;
afterEach(() => {
  if (original === undefined) delete globals.__FURN_DESKTOP_STORYBOOK_INSTANCE__;
  else globals.__FURN_DESKTOP_STORYBOOK_INSTANCE__ = original;
});

function Preview() {
  const { runtimeInstance } = useDesktopStorybookConfig();
  return <Text testID="bridge">{runtimeInstance?.bridgeNonce}</Text>;
}

test('uses the parent data module rather than a stale legacy global for an authenticated runtime', async () => {
  mockRuntimeInstance = { bridgeNonce: 'private-bridge', storybookPort: 7123 };
  globals.__FURN_DESKTOP_STORYBOOK_INSTANCE__ = { bridgeNonce: 'stale-global', storybookPort: 7999 };
  const getStorybookUI = jest.fn(() => Preview);
  const App = createDesktopStorybookApp({ getStorybookUI });
  const screen = await render(<App />);
  expect(getStorybookUI).toHaveBeenCalledWith(expect.objectContaining({ port: 7123 }));
  expect(screen.getByTestId('bridge')).toHaveTextContent('private-bridge');
});

test('preserves app-owned legacy globals when no authenticated data module is configured', async () => {
  mockRuntimeInstance = { instanceId: 'default', storybookPort: 7007 };
  globals.__FURN_DESKTOP_STORYBOOK_INSTANCE__ = { bridgeNonce: 'legacy-global', storybookPort: 7999 };
  const getStorybookUI = jest.fn(() => Preview);
  const App = createDesktopStorybookApp({ getStorybookUI });
  const screen = await render(<App />);
  expect(getStorybookUI).toHaveBeenCalledWith(expect.objectContaining({ port: 7999 }));
  expect(screen.getByTestId('bridge')).toHaveTextContent('legacy-global');
});
