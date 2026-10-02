/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { act, render } from '@testing-library/react-native';
import { isPhasedComponent, useSlot } from '@fluentui-react-native/framework-base';
import type { SlotProp } from '@fluentui-react-native/framework-base';

import { Callout } from '../Callout';
import type { CalloutHandle } from '../Callout.types';
import { Commands } from '../CalloutNativeComponent';

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  findNodeHandle: jest.fn(() => 42),
}));

type CalloutSlotConsumerProps = {
  callout: SlotProp<typeof Callout>;
};

function CalloutSlotConsumer({ callout }: CalloutSlotConsumerProps) {
  const CalloutSlot = useSlot(Callout, callout);
  return (
    <CalloutSlot accessibilityHint="rendered as a slot" testID="slotted-callout">
      <Text>Slot content</Text>
    </CalloutSlot>
  );
}

describe('Callout', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses phased rendering and applies native-safe default styling', async () => {
    expect(isPhasedComponent(Callout)).toBe(true);

    const component = await render(<Callout testID="callout" />);
    const callout = component.getByTestId('callout');

    expect(callout.type).toBe('RCTCallout');
    expect(StyleSheet.flatten(callout.props.style)).toMatchSnapshot();
  });

  it('translates caller-supplied appearance values and preserves user style precedence', async () => {
    const component = await render(
      <Callout
        backgroundColor="red"
        borderColor="green"
        borderRadius={8}
        borderWidth={2}
        maxHeight={240}
        maxWidth="80%"
        minWidth={120}
        style={{ backgroundColor: 'blue', opacity: 0.5 }}
        testID="callout"
      />,
    );
    const callout = component.getByTestId('callout');

    expect(StyleSheet.flatten(callout.props.style)).toEqual({
      position: 'absolute',
      backgroundColor: 'blue',
      borderColor: 'green',
      borderRadius: 8,
      borderWidth: 2,
      maxHeight: 240,
      maxWidth: '80%',
      minWidth: 120,
      opacity: 0.5,
    });
    expect(callout.props.backgroundColor).toBeUndefined();
    expect(callout.props.maxHeight).toBe(240);
    expect(callout.props.maxWidth).toBeUndefined();
    expect(callout.props.minWidth).toBe(120);
  });

  it('forwards native behavior, accessibility, callbacks, and children', async () => {
    const onDismiss = jest.fn();
    const onShow = jest.fn();
    const anchorRect = { screenX: 10, screenY: 20, width: 30, height: 40 };
    const component = await render(
      <Callout
        accessibilityLabel="Formatting options"
        anchorRect={anchorRect}
        beakWidth={12}
        directionalHint="rightTopEdge"
        dismissBehaviors={['preventDismissOnClickOutside']}
        gapSpace={4}
        minPadding={8}
        onDismiss={onDismiss}
        onShow={onShow}
        target="editor-anchor"
        testID="callout"
      >
        <Text>Callout content</Text>
      </Callout>,
    );
    const callout = component.getByTestId('callout');

    expect(callout.props).toMatchObject({
      accessibilityLabel: 'Formatting options',
      anchorRect,
      beakWidth: 12,
      directionalHint: 'rightTopEdge',
      dismissBehaviors: ['preventDismissOnClickOutside'],
      gapSpace: 4,
      minPadding: 8,
      onDismiss,
      onShow,
      target: 'editor-anchor',
    });
    expect(component.getByText('Callout content')).toBeTruthy();
  });

  it('resolves a React target ref to its native handle', async () => {
    const target = React.createRef<View>();
    const component = await render(
      <>
        <View ref={target} />
        <Callout target={target} testID="callout" />
      </>,
    );

    expect(target.current).not.toBeNull();
    expect(component.getByTestId('callout').props.target).toBe(42);
  });

  it('exposes native window commands through componentRef', async () => {
    const focusWindow = jest.spyOn(Commands, 'focusWindow').mockImplementation(() => undefined);
    const blurWindow = jest.spyOn(Commands, 'blurWindow').mockImplementation(() => undefined);
    const componentRef = React.createRef<CalloutHandle>();

    await render(<Callout componentRef={componentRef} testID="callout" />);

    await act(async () => {
      componentRef.current?.focusWindow();
      componentRef.current?.blurWindow();
    });

    expect(focusWindow).toHaveBeenCalledTimes(1);
    expect(blurWindow).toHaveBeenCalledTimes(1);
  });

  it('can be consumed as a slot with merged render props', async () => {
    const component = await render(<CalloutSlotConsumer callout={{ accessibilityLabel: 'Slotted Callout', target: 'slot-anchor' }} />);
    const callout = component.getByTestId('slotted-callout');

    expect(callout.props).toMatchObject({
      accessibilityHint: 'rendered as a slot',
      accessibilityLabel: 'Slotted Callout',
      target: 'slot-anchor',
    });
    expect(component.getByText('Slot content')).toBeTruthy();
  });

  it('does not send managed messages or override native restoration on Win32', async () => {
    jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
    const focus = jest.spyOn(Commands, 'focusInitialChild').mockImplementation(() => undefined);
    const close = jest.spyOn(Commands, 'closeOwned').mockImplementation(() => undefined);
    const ownedFocus = jest.spyOn(Commands, 'focusOwnedChild').mockImplementation(() => undefined);
    const componentRef = React.createRef<CalloutHandle>();
    const onDismiss = jest.fn();
    const onShow = jest.fn();
    const component = await render(
      <Callout
        componentRef={componentRef}
        menuFocusManagement
        onMenuPointerMove={jest.fn()}
        onDismiss={onDismiss}
        onShow={onShow}
        testID="callout"
      />,
    );
    const callout = component.getByTestId('callout');
    expect(callout.props.menuFocusManagement).toBeUndefined();
    expect(callout.props.onReady).toBeUndefined();
    expect(callout.props.onDismissContext).toBeUndefined();
    expect(callout.props.onManagedOperationResult).toBeUndefined();
    expect(callout.props.onRestoreFocus).toBeUndefined();
    expect(callout.props.onMenuPointerMove).toBeUndefined();
    expect(callout.props.onDismiss).toBe(onDismiss);
    expect(callout.props.onShow).toBe(onShow);
    await expect(componentRef.current?.focusInitialChild?.('old', { current: null })).resolves.toEqual({ status: 'unsupported' });
    await expect(componentRef.current?.closeOwned?.('old', 'action', true)).resolves.toEqual({
      status: 'unsupported',
      returnFocus: 'not-requested',
    });
    expect(focus).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    await expect(componentRef.current?.focusOwnedChild?.('old', { current: null }, 'repair')).resolves.toEqual({ status: 'unsupported' });
    await expect(componentRef.current?.closeOwned?.('old', 'submenu-back', true)).resolves.toEqual({
      status: 'unsupported',
      returnFocus: 'not-requested',
    });
    expect(ownedFocus).not.toHaveBeenCalled();
  });

  it('forwards original managed events and resolves only native results for the current presentation', async () => {
    jest.replaceProperty(Platform, 'OS', 'windows');
    const focus = jest.spyOn(Commands, 'focusInitialChild').mockImplementation(() => undefined);
    const close = jest.spyOn(Commands, 'closeOwned').mockImplementation(() => undefined);
    const componentRef = React.createRef<CalloutHandle>();
    const target = React.createRef<View>();
    const anchor = React.createRef<View>();
    const onReady = jest.fn();
    const onDismissContext = jest.fn();
    const component = await render(
      <>
        <View ref={anchor} />
        <Callout
          componentRef={componentRef}
          menuFocusManagement
          target={anchor}
          onReady={onReady}
          onDismissContext={onDismissContext}
          testID="callout"
        >
          <View ref={target} />
        </Callout>
      </>,
    );
    const callout = component.getByTestId('callout');
    const ready = { nativeEvent: { generation: 'native-1' } };
    callout.props.onReady(ready);
    expect(onReady).toHaveBeenCalledWith(ready);
    expect(onReady.mock.calls[0][0]).toBe(ready);
    const focused = componentRef.current!.focusInitialChild!('native-1', target);
    expect(focus).toHaveBeenCalledWith(expect.anything(), 'native-1', '1', 42);
    callout.props.onManagedOperationResult({
      nativeEvent: {
        generation: 'native-1',
        requestId: '1',
        operation: 'initial-focus',
        status: 'confirmed',
        returnFocus: 'not-requested',
      },
    });
    await expect(focused).resolves.toEqual({ status: 'confirmed' });
    const closed = componentRef.current!.closeOwned!('native-1', 'action', true);
    expect(close).toHaveBeenCalledWith(expect.anything(), 'native-1', '2', 'action', true);
    callout.props.onManagedOperationResult({
      nativeEvent: { generation: 'native-1', requestId: '2', operation: 'close', status: 'confirmed', returnFocus: 'focus-moved' },
    });
    await expect(closed).resolves.toEqual({ status: 'confirmed', returnFocus: 'focus-moved' });
    const dismissed = { nativeEvent: { generation: 'native-1', reason: 'action', returnFocus: 'focus-moved' } };
    callout.props.onDismissContext(dismissed);
    expect(onDismissContext.mock.calls[0][0]).toBe(dismissed);
    await expect(componentRef.current?.closeOwned?.('native-1', 'action', true)).resolves.toMatchObject({ status: 'not-mounted' });
  });

  it('keeps macOS-family APIs off the Windows native transport', async () => {
    jest.replaceProperty(Platform, 'OS', 'windows');
    const ownedFocus = jest.spyOn(Commands, 'focusOwnedChild').mockImplementation(() => undefined);
    const close = jest.spyOn(Commands, 'closeOwned').mockImplementation(() => undefined);
    const componentRef = React.createRef<CalloutHandle>();
    const anchor = React.createRef<View>();
    const component = await render(
      <>
        <View ref={anchor} />
        <Callout componentRef={componentRef} target={anchor} menuFocusManagement onMenuPointerMove={jest.fn()} testID="callout" />
      </>,
    );
    const callout = component.getByTestId('callout');
    callout.props.onReady({ nativeEvent: { generation: 'windows-flat' } });
    expect(callout.props.menuFocusManagement).toBe(true);
    expect(callout.props.onMenuPointerMove).toBeUndefined();
    await expect(componentRef.current?.focusOwnedChild?.('windows-flat', anchor, 'keyboard')).resolves.toEqual({ status: 'unsupported' });
    await expect(componentRef.current?.closeOwned?.('windows-flat', 'submenu-back', true)).resolves.toEqual({
      status: 'unsupported',
      returnFocus: 'not-requested',
    });
    expect(ownedFocus).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });

  it('routes macOS owned focus, child back and only current genuine movement events', async () => {
    jest.replaceProperty(Platform, 'OS', 'macos');
    const ownedFocus = jest.spyOn(Commands, 'focusOwnedChild').mockImplementation(() => undefined);
    const close = jest.spyOn(Commands, 'closeOwned').mockImplementation(() => undefined);
    const componentRef = React.createRef<CalloutHandle>();
    const target = React.createRef<View>();
    const anchor = React.createRef<View>();
    const onMenuPointerMove = jest.fn();
    const onDismiss = jest.fn();
    const component = await render(
      <>
        <View ref={anchor} />
        <Callout
          componentRef={componentRef}
          target={anchor}
          menuFocusManagement
          onMenuPointerMove={onMenuPointerMove}
          onDismiss={onDismiss}
          testID="callout"
        >
          <View ref={target} />
        </Callout>
      </>,
    );
    const callout = component.getByTestId('callout');
    callout.props.onReady({ nativeEvent: { generation: 'mac-child' } });
    const focused = componentRef.current!.focusOwnedChild!('mac-child', target, 'pointer');
    expect(ownedFocus).toHaveBeenCalledWith(expect.anything(), 'mac-child', '1', 42, 'pointer');
    callout.props.onManagedOperationResult({
      nativeEvent: {
        generation: 'mac-child',
        requestId: '1',
        operation: 'owned-child-focus',
        status: 'confirmed',
        returnFocus: 'not-requested',
      },
    });
    await expect(focused).resolves.toEqual({ status: 'confirmed' });
    const move = { nativeEvent: { generation: 'mac-child', pointerId: 'mouse', screenX: 14, screenY: 25, targetTag: 42 } };
    callout.props.onMenuPointerMove(move);
    expect(onMenuPointerMove.mock.calls[0][0]).toBe(move);
    expect(onMenuPointerMove.mock.calls[0][0].nativeEvent.targetTag).toBe(42);
    const noHit = { nativeEvent: { ...move.nativeEvent, targetTag: 0 } };
    callout.props.onMenuPointerMove(noHit);
    expect(onMenuPointerMove.mock.calls[1][0]).toBe(noHit);
    callout.props.onMenuPointerMove({ nativeEvent: { ...move.nativeEvent, generation: 'old-child' } });
    expect(onMenuPointerMove).toHaveBeenCalledTimes(2);
    expect(() => callout.props.onMenuPointerMove({ nativeEvent: { ...move.nativeEvent, screenX: NaN } })).toThrow(
      'invalid managed pointer',
    );
    expect(() => callout.props.onMenuPointerMove({ nativeEvent: { ...move.nativeEvent, targetTag: -1 } })).toThrow(
      'invalid managed pointer',
    );
    expect(() => callout.props.onMenuPointerMove({ nativeEvent: { ...move.nativeEvent, targetTag: 2147483648 } })).toThrow(
      'invalid managed pointer',
    );
    const back = componentRef.current!.closeOwned!('mac-child', 'submenu-back', true);
    expect(close).toHaveBeenCalledWith(expect.anything(), 'mac-child', '2', 'submenu-back', true);
    callout.props.onManagedOperationResult({
      nativeEvent: { generation: 'mac-child', requestId: '2', operation: 'close', status: 'confirmed', returnFocus: 'confirmed' },
    });
    await expect(back).resolves.toEqual({ status: 'confirmed', returnFocus: 'confirmed' });
    callout.props.onDismissContext({ nativeEvent: { generation: 'mac-child', reason: 'submenu-back', returnFocus: 'confirmed' } });
    expect(onDismiss).not.toHaveBeenCalled();
    callout.props.onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    callout.props.onMenuPointerMove(move);
    expect(onMenuPointerMove).toHaveBeenCalledTimes(2);
  });
});
