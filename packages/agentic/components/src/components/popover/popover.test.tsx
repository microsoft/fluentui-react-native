/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Text } from 'react-native';
import type { View } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';

import { render } from '../../common/renderWithTheme';
import { Popover } from './popover';
import type { PopoverProps } from './popover.types';

type ReactTestInstance = ReturnType<typeof screen.getByTestId>;

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  dispatchCommand: jest.fn(),
  findNodeHandle: jest.fn(() => 42),
}));

const { dispatchCommand } = jest.requireMock('react-native/Libraries/ReactNative/RendererProxy') as { dispatchCommand: jest.Mock };

type FocusCommand = { generation: number; requestId: number; targetTag: number; strategy: string };

function focusCommands(): FocusCommand[] {
  return dispatchCommand.mock.calls
    .filter(([, name]) => name === 'requestFocus')
    .map(([, , [generation, requestId, targetTag, strategy]]) => ({ generation, requestId, targetTag, strategy }));
}

function nativeCallout(): ReactTestInstance {
  let node: ReactTestInstance | null = screen.getByTestId('surface');
  while (node && !node.props.commandGeneration) node = node.parent;
  if (!node) throw new Error('Missing native Callout host');
  return node;
}

async function ready() {
  const host = nativeCallout();
  await fireEvent(host, 'ready', { nativeEvent: { generation: host.props.commandGeneration } });
  return host;
}

async function settle(host: ReactTestInstance, command: FocusCommand, status: string) {
  await fireEvent(host, 'operationResult', { nativeEvent: { generation: command.generation, requestId: command.requestId, status } });
}

async function dismiss(reason: string) {
  const host = nativeCallout();
  await fireEvent(host, 'closed', { nativeEvent: { generation: host.props.commandGeneration, reason } });
}

function trigger() {
  return screen.getByTestId('trigger');
}

function Scene(props: Partial<PopoverProps>) {
  return (
    <Popover trigger={{ content: 'Details', testID: 'trigger' }} surface={{ accessibilityLabel: 'Details', testID: 'surface' }} {...props}>
      <Text>Content</Text>
    </Popover>
  );
}

describe('Popover', () => {
  beforeEach(() => dispatchCommand.mockClear());

  it('renders a collapsed Button trigger with a popup hint and no surface while closed', async () => {
    const ref = React.createRef<View>();
    await render(<Scene ref={ref} testID="root" />);
    expect(trigger().props.role).toBe('button');
    expect(trigger().props.accessibilityState).toMatchObject({ expanded: false });
    expect(trigger().props.accessibilityHint).toBe('Opens a popover');
    expect(screen.queryByTestId('surface')).toBeNull();
    expect(ref.current).not.toBeNull();
  });

  it('keeps a caller trigger hint and composes caller trigger handlers', async () => {
    const onPress = jest.fn();
    await render(<Scene trigger={{ content: 'Details', testID: 'trigger', accessibilityHint: 'Shows details', onPress }} />);
    expect(trigger().props.accessibilityHint).toBe('Shows details');
    await fireEvent.press(trigger());
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('surface')).toBeTruthy();
  });

  it('opens from the trigger as a named group anchored below and centered by the token gap', async () => {
    const onOpenChange = jest.fn();
    await render(<Scene onOpenChange={onOpenChange} />);
    await fireEvent.press(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'trigger' });
    expect(trigger().props.accessibilityState).toMatchObject({ expanded: true });
    const surface = screen.getByTestId('surface');
    expect(surface.props).toMatchObject({ accessible: true, role: 'group', accessibilityLabel: 'Details', focusable: false });
    const host = nativeCallout();
    expect(host.props).toMatchObject({ target: 42, anchorMode: 'view', directionalHint: 'bottomCenter', gapSpace: 4 });
  });

  it('maps logical placement and alignment to native hints', async () => {
    await render(<Scene defaultOpen placement="top" align="start" />);
    expect(nativeCallout().props.directionalHint).toBe('topLeftEdge');
  });

  it('styles the surface from tokens with the caller style last', async () => {
    await render(<Scene defaultOpen surface={{ accessibilityLabel: 'Details', testID: 'surface', style: { padding: 2 } }} />);
    const style = Object.assign({}, ...[screen.getByTestId('surface').props.style].flat(Infinity).filter(Boolean));
    expect(style).toMatchObject({ borderStyle: 'solid', padding: 2 });
    expect(style.backgroundColor).toBeDefined();
    expect(style.borderRadius).toBeGreaterThan(0);
  });

  it('enters the first eligible content after native readiness', async () => {
    await render(<Scene defaultOpen />);
    expect(focusCommands()).toHaveLength(0);
    const host = await ready();
    const [first] = focusCommands();
    expect(first.strategy).toBe('first');
    await settle(host, first, 'confirmed');
    expect(focusCommands()).toHaveLength(1);
    expect(screen.getByTestId('surface').props.focusable).toBe(false);
  });

  it('falls back to a focusable surface when the content has no focus target', async () => {
    await render(<Scene defaultOpen />);
    const host = await ready();
    await settle(host, focusCommands()[0], 'not-mounted');
    expect(screen.getByTestId('surface').props.focusable).toBe(true);
    const commands = focusCommands();
    expect(commands).toHaveLength(2);
    expect(commands[1]).toMatchObject({ strategy: 'target', targetTag: 42 });
  });

  it('reports native dismissal without moving focus for outside input', async () => {
    const onOpenChange = jest.fn();
    const triggerRef = React.createRef<View>();
    await render(<Scene defaultOpen onOpenChange={onOpenChange} trigger={{ content: 'Details', testID: 'trigger', ref: triggerRef }} />);
    const focus = jest.spyOn(triggerRef.current, 'focus');
    focus.mockClear();
    await ready();
    await dismiss('outside-pointer');
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'dismiss' });
    expect(screen.queryByTestId('surface')).toBeNull();
    expect(trigger().props.accessibilityState).toMatchObject({ expanded: false });
    expect(focus).not.toHaveBeenCalled();
  });

  it('returns focus to the trigger after Escape', async () => {
    const triggerRef = React.createRef<View>();
    await render(<Scene defaultOpen trigger={{ content: 'Details', testID: 'trigger', ref: triggerRef }} />);
    const focus = jest.spyOn(triggerRef.current, 'focus');
    focus.mockClear();
    await ready();
    await dismiss('escape');
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('returns focus to the trigger when the caller closes a focused presentation', async () => {
    const triggerRef = React.createRef<View>();
    const props = { trigger: { content: 'Details', testID: 'trigger', ref: triggerRef } };
    const view = await render(<Scene open {...props} />);
    const focus = jest.spyOn(triggerRef.current, 'focus');
    focus.mockClear();
    const host = await ready();
    await settle(host, focusCommands()[0], 'confirmed');
    await view.rerender(<Scene open={false} {...props} />);
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('does not move focus when the caller closes a presentation that never held focus', async () => {
    const triggerRef = React.createRef<View>();
    const props = { trigger: { content: 'Details', testID: 'trigger', ref: triggerRef } };
    const view = await render(<Scene open {...props} />);
    const focus = jest.spyOn(triggerRef.current, 'focus');
    focus.mockClear();
    await ready();
    await view.rerender(<Scene open={false} {...props} />);
    expect(focus).not.toHaveBeenCalled();
  });

  it('closes from the trigger without reporting caller-driven changes', async () => {
    const onOpenChange = jest.fn();
    const view = await render(<Scene defaultOpen onOpenChange={onOpenChange} />);
    await fireEvent.press(trigger());
    expect(onOpenChange.mock.calls).toEqual([[false, { reason: 'trigger' }]]);
    expect(screen.queryByTestId('surface')).toBeNull();
    onOpenChange.mockClear();
    await view.rerender(<Scene open onOpenChange={onOpenChange} />);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('does not reopen a popup that was open when a trigger press began', async () => {
    const onOpenChange = jest.fn();
    await render(<Scene defaultOpen onOpenChange={onOpenChange} />);
    await ready();
    await fireEvent(trigger(), 'pressIn');
    await dismiss('outside-pointer');
    await fireEvent.press(trigger());
    expect(onOpenChange.mock.calls).toEqual([[false, { reason: 'dismiss' }]]);
    expect(screen.queryByTestId('surface')).toBeNull();
  });

  it('latches a controlled popup closed after native dismissal until the trigger rearms it', async () => {
    const onOpenChange = jest.fn();
    await render(<Scene open onOpenChange={onOpenChange} />);
    const firstGeneration = (await ready()).props.commandGeneration;
    await dismiss('escape');
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'dismiss' });
    expect(screen.queryByTestId('surface')).toBeNull();
    expect(trigger().props.accessibilityState).toMatchObject({ expanded: false });
    await fireEvent.press(trigger());
    expect(onOpenChange).toHaveBeenLastCalledWith(true, { reason: 'trigger' });
    expect(nativeCallout().props.commandGeneration).not.toBe(firstGeneration);
    expect(trigger().props.accessibilityState).toMatchObject({ expanded: true });
  });

  it('rearms a latched controlled popup when the caller closes and reopens it', async () => {
    const view = await render(<Scene open />);
    await ready();
    await dismiss('outside-pointer');
    await view.rerender(<Scene open={false} />);
    await view.rerender(<Scene open />);
    expect(screen.getByTestId('surface')).toBeTruthy();
  });

  it('warns when the surface is unnamed or nested inside another Popover', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(
      <Popover defaultOpen trigger={{ content: 'Outer' }} surface={{ testID: 'surface' }}>
        <Popover trigger={{ content: 'Inner' }} surface={{ accessibilityLabel: 'Inner' }}>
          <Text>Nested</Text>
        </Popover>
      </Popover>,
    );
    expect(warn).toHaveBeenCalledWith('Popover: name the surface with an accessibilityLabel.');
    expect(warn).toHaveBeenCalledWith('Popover: do not render a Popover inside another Popover.');
    warn.mockRestore();
  });

  it('fails descriptively on hosts without a modern native route', () => {
    jest.isolateModules(() => {
      jest.doMock('./popoverNative', () => ({ popoverNativeHost: undefined }));
      const { usePopover_unstable } = require('./usePopover') as typeof import('./usePopover');
      expect(() => usePopover_unstable({ trigger: {}, children: null })).toThrow(/#4384/);
    });
  });

  it('cancels pending work when unmounted while open', async () => {
    const view = await render(<Scene defaultOpen />);
    await ready();
    await act(async () => view.unmount());
    expect(screen.queryByTestId('surface')).toBeNull();
  });
});
