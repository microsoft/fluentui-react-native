import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { addons } from 'storybook/preview-api';

import { DesktopDriverBridge } from './DesktopDriverBridge';
import { DesktopStoryRoot } from './DesktopStoryRoot';
import { DesktopStorybookConfigProvider, useDesktopStorybookConfig } from './DesktopStorybookConfig';

jest.mock('storybook/preview-api', () => ({ addons: { getChannel: jest.fn() } }));
jest.mock('storybook/internal/core-events', () => ({ CHANNEL_WS_DISCONNECT: 'channelWSDisconnect' }));

type Listener = (payload: unknown) => void;
const listeners = new Map<string, Set<Listener>>();
const channel = {
  emit: jest.fn(),
  off: jest.fn((type: string, listener: Listener) => listeners.get(type)?.delete(listener)),
  on: jest.fn((type: string, listener: Listener) => {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type)!.add(listener);
  }),
};

const runtimeInstance = {
  bridgeNonce: 'nonce',
  endpoint: 'macos' as const,
  instanceId: 'instance',
  platformManifestDigest: 'platform',
  portablePlanDigest: 'portable',
  targetId: 'target',
};
const request = { connectionEpoch: 'epoch', requestId: 'request', runId: 'run', selectionSequence: 1, storyId: 'a' };

async function receive(type: string, payload?: unknown) {
  await act(() => {
    for (const listener of listeners.get(type) ?? []) listener(payload);
  });
}

function App({ storyId = 'a' }: { storyId?: string }) {
  return (
    <DesktopStorybookConfigProvider runtimeInstance={runtimeInstance} testIDPrefix="test">
      <DesktopDriverBridge />
      <DesktopStoryRoot storyId={storyId}>
        <Text testID="content">{storyId}</Text>
      </DesktopStoryRoot>
    </DesktopStorybookConfigProvider>
  );
}

beforeEach(() => {
  listeners.clear();
  jest.clearAllMocks();
  jest.mocked(addons.getChannel).mockReturnValue(channel as unknown as ReturnType<typeof addons.getChannel>);
});

test('authenticates a challenge and produces versioned ready and native markers from the same selection', async () => {
  const scene = await render(<App />);
  expect(channel.emit).toHaveBeenCalledWith('furn:desktop:request-challenge');
  await receive('furn:desktop:request-hello', { version: 2, connectionEpoch: 'epoch' });
  expect(channel.emit).toHaveBeenCalledWith('furn:desktop:hello', {
    connectionEpoch: 'epoch',
    endpoint: 'macos',
    instanceId: 'instance',
    nonce: 'nonce',
    platformManifestDigest: 'platform',
    targetId: 'target',
    version: 2,
  });
  await receive('furn:desktop:prepare-story', request);
  const marker = {
    connectionEpoch: 'epoch',
    markerVersion: 1,
    previewGeneration: 1,
    requestId: 'request',
    runId: 'run',
    storyId: 'a',
  };
  expect(JSON.parse(scene.getByTestId('test-story-root').props.accessibilityLabel)).toEqual(marker);
  expect(channel.emit).toHaveBeenCalledWith('furn:desktop:story-ready', { ...marker, portablePlanDigest: 'portable' });
  await scene.unmount();
  expect([...listeners.values()].every((set) => set.size === 0)).toBe(true);
});

test('old prepares and old render trees cannot replace a newer selection; cancellation hides late content', async () => {
  const scene = await render(<App />);
  await receive('furn:desktop:request-hello', { version: 2, connectionEpoch: 'epoch' });
  await receive('furn:desktop:prepare-story', request);
  const next = { ...request, requestId: 'next', runId: 'next', storyId: 'b', selectionSequence: 2 };
  await receive('furn:desktop:prepare-story', next);
  expect(scene.queryByTestId('content')).toBeNull();
  await receive('furn:desktop:prepare-story', request);
  expect(scene.queryByTestId('content')).toBeNull();
  await scene.rerender(<App storyId="b" />);
  expect(scene.getByTestId('content').props.children).toBe('b');
  await receive('furn:desktop:cancel-story', request);
  expect(scene.getByTestId('content')).toBeDefined();
  await receive('furn:desktop:cancel-story', next);
  expect(scene.queryByTestId('content')).toBeNull();
  channel.emit.mockClear();
  await scene.rerender(<App storyId="a" />);
  await scene.rerender(<App storyId="b" />);
  expect(scene.queryByTestId('content')).toBeNull();
  expect(channel.emit).not.toHaveBeenCalled();
});

test('disconnect invalidates captured lifetimes and a new connection rejects previous-epoch messages', async () => {
  let latest!: ReturnType<typeof useDesktopStorybookConfig>;
  function Capture() {
    latest = useDesktopStorybookConfig();
    return null;
  }
  await render(
    <DesktopStorybookConfigProvider runtimeInstance={runtimeInstance} testIDPrefix="test">
      <DesktopDriverBridge />
      <Capture />
    </DesktopStorybookConfigProvider>,
  );
  await receive('furn:desktop:request-hello', { version: 2, connectionEpoch: 'epoch' });
  await receive('furn:desktop:prepare-story', request);
  const old = latest.selection!;
  expect(latest.isCurrentSelection(old)).toBe(true);
  await receive('channelWSDisconnect');
  expect(latest.isCurrentSelection(old)).toBe(false);
  await receive('furn:desktop:request-hello', { version: 2, connectionEpoch: 'new-epoch' });
  await receive('furn:desktop:prepare-story', { ...request, selectionSequence: 10 });
  expect(latest.selection).toBeUndefined();
  await receive('furn:desktop:prepare-story', { ...request, connectionEpoch: 'new-epoch' });
  expect(latest.selection?.connectionEpoch).toBe('new-epoch');
  expect(latest.isCurrentSelection(old)).toBe(false);
});
