import * as React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { theme } from '@storybook/react-native-theming';

import { DesktopStorybookConfigProvider, useDesktopStorybookConfig } from './DesktopStorybookConfig';
import { StorybookUIComponent } from './StorybookUI.win32';

jest.mock('@storybook/react-native-ui-common', () => ({
  StorageProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@storybook/react-native-ui-lite', () => ({ Sidebar: () => null }));
jest.mock('./Win32AddonsPanel', () => ({ Win32AddonsPanel: () => null }));
jest.mock('./Win32CalloutPortal', () => ({ Win32CalloutPortal: () => null }));
jest.mock('./Win32ResizeHandle', () => ({ Win32ResizeHandle: () => null }));

const storage = { getItem: () => null, setItem: () => undefined };
const setStory = jest.fn();

function Canvas() {
  const [offset, setOffset] = React.useState(0);
  return (
    <>
      <Text testID="canvas-offset">{offset}</Text>
      <Pressable testID="scroll-canvas" onPress={() => setOffset(99)} />
    </>
  );
}

function Harness({ requestId }: { requestId: string }) {
  const { prepareStory } = useDesktopStorybookConfig();
  React.useEffect(() => {
    prepareStory({ requestId, runId: 'fixture-run', storyId: 'fixture--default' });
  }, [prepareStory, requestId]);
  return (
    <StorybookUIComponent setStory={setStory} storage={storage} storyHash={{}} theme={theme}>
      <Canvas />
    </StorybookUIComponent>
  );
}

function scene(requestId: string) {
  return (
    <DesktopStorybookConfigProvider testIDPrefix="test">
      <Harness requestId={requestId} />
    </DesktopStorybookConfigProvider>
  );
}

test('resets the whole Win32 preview for a new test generation without resetting chrome preferences', async () => {
  const screen = await render(scene('first'));
  await fireEvent.press(screen.getByTestId('scroll-canvas'));
  expect(screen.getByTestId('canvas-offset')).toHaveTextContent('99');
  await fireEvent.press(screen.getByTestId('test-win32-hide-sidebar'));
  expect(screen.getByTestId('test-win32-show-sidebar')).toBeOnTheScreen();
  expect(screen.getByTestId('canvas-offset')).toHaveTextContent('99');

  await screen.rerender(scene('second'));

  expect(screen.getByTestId('canvas-offset')).toHaveTextContent('0');
  expect(screen.getByTestId('test-win32-show-sidebar')).toBeOnTheScreen();
});
