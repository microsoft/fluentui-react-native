import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { theme } from '@storybook/react-native-theming';

import { DesktopStorybookConfigProvider, useDesktopStorybookConfig } from './DesktopStorybookConfig';
import { createDesktopStorybookPreview } from './createDesktopStorybookPreview';
import { Win32StoryViewport } from './createDesktopStorybookPreview.win32';
import { StorybookUIComponent } from './StorybookUI.win32';

jest.mock('@storybook/react-native-ui-common', () => ({
  StorageProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@storybook/react-native-ui-lite', () => ({ Sidebar: () => null }));
jest.mock('./Win32AddonsPanel', () => ({ Win32AddonsPanel: () => null }));
jest.mock('./Win32CalloutPortal', () => ({ Win32CalloutPortal: () => null }));
jest.mock('./Win32ResizeHandle', () => ({ Win32ResizeHandle: () => null }));
jest.mock('./DesktopStoryRoot', () => ({ DesktopStoryRoot: ({ children }: { children: React.ReactNode }) => children }));

const storage = { getItem: () => null, setItem: () => undefined };
const setStory = jest.fn();

function LiteUIStoryViewport({ children }: { children: React.ReactNode }) {
  const decorate = createDesktopStorybookPreview().decorators?.[0];
  if (!decorate) {
    throw new Error('The desktop preview must provide its story decorator.');
  }
  return decorate(() => <>{children}</>, { id: 'fixture--oversized' } as Parameters<typeof decorate>[1]);
}

function Canvas() {
  const [offset, setOffset] = React.useState(0);
  return (
    <Win32StoryViewport>
      <Text testID="canvas-offset">{offset}</Text>
      <Pressable testID="scroll-canvas" onPress={() => setOffset(99)} />
    </Win32StoryViewport>
  );
}

function Harness({ requestId, selectionSequence }: { requestId: string; selectionSequence: number }) {
  const { connectBridge, prepareStory } = useDesktopStorybookConfig();
  React.useEffect(() => {
    connectBridge('fixture-epoch');
    prepareStory({
      connectionEpoch: 'fixture-epoch',
      selectionSequence,
      requestId,
      runId: 'fixture-run',
      storyId: 'fixture--default',
    });
  }, [connectBridge, prepareStory, requestId, selectionSequence]);
  return (
    <StorybookUIComponent setStory={setStory} storage={storage} storyHash={{}} theme={theme}>
      <Canvas />
    </StorybookUIComponent>
  );
}

function scene(requestId: string, selectionSequence: number) {
  return (
    <DesktopStorybookConfigProvider testIDPrefix="test">
      <Harness requestId={requestId} selectionSequence={selectionSequence} />
    </DesktopStorybookConfigProvider>
  );
}

// Cold CI workers can take more than five seconds to initialize the real ScrollView.
test('resets the whole Win32 preview for a new test generation without resetting chrome preferences', async () => {
  const screen = await render(scene('first', 1));
  await fireEvent.press(screen.getByTestId('scroll-canvas'));
  expect(screen.getByTestId('canvas-offset')).toHaveTextContent('99');
  await fireEvent.press(screen.getByTestId('test-win32-hide-sidebar'));
  expect(screen.getByTestId('test-win32-show-sidebar')).toBeOnTheScreen();
  expect(screen.getByTestId('canvas-offset')).toHaveTextContent('99');

  await screen.rerender(scene('second', 2));

  expect(screen.getByTestId('canvas-offset')).toHaveTextContent('0');
  expect(screen.getByTestId('test-win32-show-sidebar')).toBeOnTheScreen();
}, 15_000);

test.each<[string, React.ComponentType<{ children: React.ReactNode }>]>([
  ['Win32', Win32StoryViewport],
  ['LiteUI', LiteUIStoryViewport],
])(
  'allows oversized %s stories to grow inside the scrollable preview rather than overflow a fixed-height centered view',
  async (_, Viewport) => {
    const screen = await render(
      <DesktopStorybookConfigProvider testIDPrefix="test">
        <Viewport>
          <View style={{ height: 700 }}>
            <Text testID="last-control">Last control</Text>
          </View>
        </Viewport>
      </DesktopStorybookConfigProvider>,
    );
    const viewport = screen.getByTestId('test-story-viewport');
    const contentStyle = StyleSheet.flatten(viewport.props.contentContainerStyle);
    expect(contentStyle).toMatchObject({ flexGrow: 1, justifyContent: 'center' });
    expect(contentStyle.flex).toBeUndefined();
    expect(viewport.props.keyboardShouldPersistTaps).toBe('handled');
    expect(screen.getByTestId('last-control')).toBeOnTheScreen();
  },
);
