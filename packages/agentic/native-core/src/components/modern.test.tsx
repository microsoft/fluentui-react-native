/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Platform, View, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { useSlot } from '@fluentui-react-native/framework-base';

import { Callout } from './callout/Callout';
import type { CalloutHandle, CalloutPresentation } from './callout/Callout.types';
import { FocusZone } from './focus-zone/FocusZone';
import type { FocusZoneCommands, FocusZoneHandle } from './focus-zone/FocusZone.types';
import { useNativeViewTarget, resolveTarget } from './nativeTarget';
import { FocusCommands } from '../internal/focusZoneCommands';
import { Commands as CalloutCommands } from '../specs/components/CalloutNativeComponent';

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  findNodeHandle: jest.fn(() => 42),
}));

function calloutRoot(component: Awaited<ReturnType<typeof render>>) {
  let root = component.getByTestId('content').parent;
  while (root && !root.props.commandGeneration) root = root.parent;
  if (!root) throw new Error('Missing native Callout ancestor');
  return root;
}

describe('modern native facades', () => {
  beforeEach(() => jest.replaceProperty(Platform, 'OS', 'macos'));
  afterEach(() => jest.restoreAllMocks());

  it('preserves the native FocusZone ref and confirms the separate command from a result event', async () => {
    const nativeRef = React.createRef<FocusZoneHandle>();
    const commandsRef = React.createRef<FocusZoneCommands>();
    const dispatch = jest.spyOn(FocusCommands, 'requestFocus').mockImplementation(() => undefined);
    const component = await render(
      <FocusZone ref={nativeRef} commandsRef={commandsRef} direction="vertical" testID="zone">
        <View />
      </FocusZone>,
    );
    expect(nativeRef.current).not.toBeNull();
    expect(commandsRef.current).not.toBeNull();
    const root = component.getByTestId('zone');
    let result: ReturnType<FocusZoneCommands['requestFocus']>;
    await act(async () => {
      result = commandsRef.current.requestFocus('first');
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
    const [, generation, requestId, , strategy] = dispatch.mock.calls[0];
    expect(strategy).toBe('first');
    await fireEvent(root, 'operationResult', { nativeEvent: { generation, requestId, status: 'confirmed' } });
    expect(await result).toEqual({ status: 'confirmed' });
    const old = commandsRef.current;
    await component.unmount();
    expect(nativeRef.current).toBeNull();
    expect(commandsRef.current).toBeNull();
    expect(await old.requestFocus()).toEqual({ status: 'not-mounted' });
  });

  it('keeps live attachments generation-safe through same-node handoff and stale cleanup', async () => {
    let binding: ReturnType<typeof useNativeViewTarget>;
    const node = React.createRef<View>();
    function Fixture() {
      binding = useNativeViewTarget();
      return <View ref={node} />;
    }
    const component = await render(<Fixture />);
    await act(async () => {
      const firstCleanup = binding.ref(node.current);
      const captured = resolveTarget(binding.target);
      const secondCleanup = binding.ref(node.current);
      if (typeof firstCleanup !== 'function' || typeof secondCleanup !== 'function') throw new Error('Missing callback cleanup');
      firstCleanup();
      expect(captured.isCurrent()).toBe(true);
      secondCleanup();
      expect(captured.isCurrent()).toBe(false);
    });
    await component.unmount();
  });

  it('exposes readiness, latches physical close, and ignores old-generation events after rearm', async () => {
    const ref = React.createRef<CalloutHandle>();
    const ready = jest.fn();
    const dismissed = jest.fn();
    function Fixture({ open, rearm = 'one' }: { open: boolean; rearm?: string }) {
      const anchor = useNativeViewTarget();
      return (
        <>
          <View ref={anchor.ref} />
          <Callout
            ref={ref}
            open={open}
            presentationKey={rearm}
            anchor={{ kind: 'view', target: anchor.target }}
            onReady={ready}
            onDismissed={dismissed}
            content={{ testID: 'content', accessibilityLabel: 'popup content' }}
          >
            <Text>Child</Text>
          </Callout>
        </>
      );
    }
    const component = await render(<Fixture open />);
    const root = calloutRoot(component);
    const oldClosed = root.props.onClosed;
    const oldGeneration = root.props.commandGeneration;
    expect(ref.current.getPresentation()).toBeNull();
    await fireEvent(root, 'ready', { nativeEvent: { generation: root.props.commandGeneration } });
    const oldPresentation = ref.current.getPresentation();
    expect(oldPresentation).not.toBeNull();
    expect(ready).toHaveBeenCalledTimes(1);
    await fireEvent(root, 'closed', { nativeEvent: { generation: root.props.commandGeneration, reason: 'native-light-dismiss' } });
    expect(component.queryByTestId('content')).toBeNull();
    await component.rerender(<Fixture open />);
    expect(component.queryByTestId('content')).toBeNull();
    await component.rerender(<Fixture open rearm="two" />);
    const next = calloutRoot(component);
    expect(next.props.commandGeneration).not.toBe(oldGeneration);
    await act(async () => oldClosed({ nativeEvent: { generation: oldGeneration, reason: 'programmatic' } }));
    expect(component.getByTestId('content')).toBeTruthy();
    expect(dismissed).toHaveBeenCalledTimes(1);
    expect(await ref.current.close(oldPresentation)).toEqual({ status: 'not-ready' });
    await component.unmount();
  });

  it('settles a close result before invalidating the presentation and forwards local point geometry', async () => {
    const ref = React.createRef<CalloutHandle>();
    const dispatch = jest.spyOn(CalloutCommands, 'close').mockImplementation(() => undefined);
    function Fixture() {
      const anchor = useNativeViewTarget();
      return (
        <>
          <View ref={anchor.ref} />
          <Callout
            ref={ref}
            open
            content={{ testID: 'content' }}
            anchor={{ kind: 'point', relativeTo: anchor.target, point: { x: 3, y: 7 } }}
          >
            <View />
          </Callout>
        </>
      );
    }
    const component = await render(<Fixture />);
    const root = calloutRoot(component);
    expect(root.props.anchorRect).toEqual({ screenX: 3, screenY: 7, width: 0, height: 0 });
    await fireEvent(root, 'ready', { nativeEvent: { generation: root.props.commandGeneration } });
    const presentation: CalloutPresentation = ref.current.getPresentation();
    let result: ReturnType<CalloutHandle['close']>;
    await act(async () => {
      result = ref.current.close(presentation);
    });
    const [, generation, requestId] = dispatch.mock.calls[0];
    await fireEvent(root, 'operationResult', { nativeEvent: { generation, requestId, status: 'confirmed' } });
    await fireEvent(root, 'closed', { nativeEvent: { generation, reason: 'programmatic' } });
    expect(await result).toEqual({ status: 'confirmed' });
    await component.unmount();
  });

  it('honors refs, live defaults, and lifecycle props supplied at slot render time', async () => {
    const commands = React.createRef<FocusZoneCommands>();
    const native = React.createRef<FocusZoneHandle>();
    const presentation = React.createRef<CalloutHandle>();
    function Fixture({ open }: { open: boolean }) {
      const target = useNativeViewTarget();
      const Zone = useSlot(FocusZone, {});
      const Popup = useSlot(Callout, {});
      return (
        <>
          <Zone ref={native} commandsRef={commands} defaultTarget={target.target} testID="zone">
            <View ref={target.ref} />
          </Zone>
          <Popup ref={presentation} open={open} anchor={{ kind: 'view', target: target.target }} content={{ testID: 'content' }}>
            <View />
          </Popup>
        </>
      );
    }
    const component = await render(<Fixture open />);
    expect(native.current).not.toBeNull();
    expect(commands.current).not.toBeNull();
    expect(presentation.current).not.toBeNull();
    expect(component.getByTestId('zone').props.defaultTabbableElement).toBe(42);
    const first = calloutRoot(component).props.commandGeneration;
    await component.rerender(<Fixture open={false} />);
    expect(component.queryByTestId('content')).toBeNull();
    await component.rerender(<Fixture open />);
    expect(calloutRoot(component).props.commandGeneration).not.toBe(first);
    await component.unmount();
  });
});
