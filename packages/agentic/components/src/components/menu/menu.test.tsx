/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Text } from 'react-native';
import type { View } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';

import { render } from '../../common/renderWithTheme';
import { Divider } from '../divider/divider';
import { MenuItem } from '../menu-item/menu-item';
import type { MenuItemProps } from '../menu-item/menu-item.types';
import { Menu } from './menu';
import { findTypeAheadRow, getInlineArrows, getTypeAheadCharacter } from './menuNavigation';
import type { MenuProps } from './menu.types';

type ReactTestInstance = ReturnType<typeof screen.getByTestId>;

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  dispatchCommand: jest.fn(),
  findNodeHandle: jest.fn(() => 42),
}));

const { dispatchCommand } = jest.requireMock('react-native/Libraries/ReactNative/RendererProxy') as { dispatchCommand: jest.Mock };

function focusStrategies(): string[] {
  return dispatchCommand.mock.calls.filter(([, name]) => name === 'requestFocus').map(([, , args]) => args[args.length - 1]);
}

function hostOf(testId: string, prop: string): ReactTestInstance {
  let node: ReactTestInstance | null = screen.getByTestId(testId);
  while (node && node.props[prop] === undefined) node = node.parent;
  if (!node) throw new Error(`Missing native host with ${prop}`);
  return node;
}

async function ready(surfaceId = 'surface') {
  const host = hostOf(surfaceId, 'anchorMode');
  await fireEvent(host, 'ready', { nativeEvent: { generation: host.props.commandGeneration } });
  return host;
}

async function dismiss(reason: string, surfaceId = 'surface') {
  const host = hostOf(surfaceId, 'anchorMode');
  await fireEvent(host, 'closed', { nativeEvent: { generation: host.props.commandGeneration, reason } });
}

const keyboardPress = { nativeEvent: { key: 'Enter' } };
const pointerPress = { nativeEvent: {} };

function row(content: string, props?: MenuItemProps): MenuItemProps {
  return { content, secondaryContent: null, icon: null, testID: content.toLowerCase(), ...props };
}

function Scene(props: Partial<MenuProps> & { onCut?: () => void; onEmail?: () => void }) {
  const { onCut, onEmail, ...menuProps } = props;
  return (
    <Menu trigger={{ content: 'Edit', testID: 'trigger' }} surface={{ testID: 'surface' }} {...menuProps}>
      <MenuItem {...row('Cut', { onPress: onCut })} />
      <MenuItem {...row('Paste', { disabled: true })} />
      <Divider label={null} />
      <MenuItem
        {...row('Share', { submenu: { testID: 'share-surface', children: <MenuItem {...row('Email', { onPress: onEmail })} /> } })}
      />
      <MenuItem {...row('Delete')} />
    </Menu>
  );
}

describe('Menu', () => {
  beforeEach(() => dispatchCommand.mockClear());

  it('renders a collapsed Button trigger with a menu hint and no surface while closed', async () => {
    const ref = React.createRef<View>();
    await render(<Scene ref={ref} testID="root" />);
    expect(screen.getByTestId('trigger').props.role).toBe('button');
    expect(screen.getByTestId('trigger').props.accessibilityState).toMatchObject({ expanded: false });
    expect(screen.getByTestId('trigger').props.accessibilityHint).toBe('Opens a menu');
    expect(screen.queryByTestId('surface')).toBeNull();
    expect(ref.current).not.toBeNull();
  });

  it('opens from the keyboard with a named menu surface and enters its first row', async () => {
    const onOpenChange = jest.fn();
    await render(<Scene onOpenChange={onOpenChange} />);
    await fireEvent(screen.getByTestId('trigger'), 'press', keyboardPress);
    expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'trigger' });
    const surface = screen.getByTestId('surface');
    expect(surface.props.role).toBe('menu');
    expect(surface.props.accessibilityLabel).toBe('Edit');
    expect(surface.props.focusable).toBe(false);
    expect(screen.getByTestId('trigger').props.accessibilityState).toMatchObject({ expanded: true });
    expect(hostOf('surface', 'anchorMode').props.tabNavigation).toBe('dismiss');
    await ready();
    expect(focusStrategies()).toEqual(['first']);
  });

  it('opens from the pointer on its focusable surface without highlighting a row', async () => {
    await render(<Scene />);
    await fireEvent(screen.getByTestId('trigger'), 'press', pointerPress);
    expect(screen.getByTestId('surface').props.focusable).toBe(true);
    await ready();
    expect(focusStrategies()).toEqual(['target']);
  });

  it('runs an activated row once, closes the menu, and reports the action', async () => {
    const onCut = jest.fn();
    const onOpenChange = jest.fn();
    await render(<Scene onCut={onCut} onOpenChange={onOpenChange} />);
    await fireEvent(screen.getByTestId('trigger'), 'press', keyboardPress);
    await fireEvent(screen.getByTestId('cut'), 'press', keyboardPress);
    expect(onCut).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'action' });
    expect(screen.queryByTestId('surface')).toBeNull();
  });

  it('latches a controlled menu closed after native dismissal until the trigger rearms it', async () => {
    const onOpenChange = jest.fn();
    await render(<Scene open onOpenChange={onOpenChange} />);
    await dismiss('escape');
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'dismiss' });
    expect(screen.queryByTestId('surface')).toBeNull();
    expect(screen.getByTestId('trigger').props.accessibilityState).toMatchObject({ expanded: false });
    await fireEvent(screen.getByTestId('trigger'), 'press', keyboardPress);
    expect(screen.getByTestId('surface')).toBeTruthy();
  });

  it('closes on a trigger press that began while open without reopening', async () => {
    const onOpenChange = jest.fn();
    await render(<Scene onOpenChange={onOpenChange} />);
    const trigger = screen.getByTestId('trigger');
    await fireEvent(trigger, 'press', keyboardPress);
    await fireEvent(trigger, 'pressIn', pointerPress);
    await dismiss('outside-pointer');
    await fireEvent(trigger, 'press', pointerPress);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'dismiss' });
    expect(screen.queryByTestId('surface')).toBeNull();
  });

  it('handles Home, End, and the submenu arrow through the focus zone and submenu', async () => {
    const onEmail = jest.fn();
    const onOpenChange = jest.fn();
    await render(<Scene onEmail={onEmail} onOpenChange={onOpenChange} />);
    await fireEvent(screen.getByTestId('trigger'), 'press', keyboardPress);
    await ready();
    dispatchCommand.mockClear();
    await fireEvent(screen.getByTestId('cut'), 'keyDown', { nativeEvent: { key: 'End' } });
    await fireEvent(screen.getByTestId('cut'), 'keyDown', { nativeEvent: { key: 'Home' } });
    expect(focusStrategies()).toEqual(['last', 'first']);

    const share = screen.getByTestId('share');
    expect(share.props.accessibilityState).toMatchObject({ expanded: false });
    expect(share.props.accessibilityHint).toBe('Has submenu');
    await fireEvent(share, 'keyDown', { nativeEvent: { key: getInlineArrows(false).open } });
    expect(screen.getByTestId('share').props.accessibilityState).toMatchObject({ expanded: true });
    const submenu = screen.getByTestId('share-surface');
    expect(submenu.props.role).toBe('menu');
    expect(submenu.props.accessibilityLabel).toBe('Share');
    expect(hostOf('share-surface', 'anchorMode').props.directionalHint).toBe('rightTopEdge');

    await fireEvent(screen.getByTestId('email'), 'press', pointerPress);
    expect(onEmail).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'action' });
    expect(screen.queryByTestId('share-surface')).toBeNull();
  });

  it('toggles a submenu from the pointer and opens it on hover after the delay', async () => {
    jest.useFakeTimers();
    try {
      await render(<Scene submenuOpenDelay={50} />);
      await fireEvent(screen.getByTestId('trigger'), 'press', pointerPress);
      await fireEvent(screen.getByTestId('share'), 'press', pointerPress);
      expect(screen.getByTestId('share-surface')).toBeTruthy();
      await fireEvent(screen.getByTestId('share'), 'press', pointerPress);
      expect(screen.queryByTestId('share-surface')).toBeNull();

      await fireEvent(screen.getByTestId('share'), 'hoverIn', {});
      expect(screen.queryByTestId('share-surface')).toBeNull();
      await act(async () => {
        jest.advanceTimersByTime(50);
      });
      expect(screen.getByTestId('share-surface')).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });

  it('keeps hover from opening submenus when disabled', async () => {
    jest.useFakeTimers();
    try {
      await render(<Scene submenuOpenOnHover={false} />);
      await fireEvent(screen.getByTestId('trigger'), 'press', pointerPress);
      await fireEvent(screen.getByTestId('share'), 'hoverIn', {});
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.queryByTestId('share-surface')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('applies the platform disabled-focusable default to rows and lets the menu override it', async () => {
    const { rerender } = await render(<Scene open />);
    expect(screen.getByTestId('paste').props.focusable).toBe(false);
    expect(screen.getByTestId('paste').props.accessibilityState).toMatchObject({ disabled: true });
    await rerender(<Scene open disabledFocusable />);
    expect(screen.getByTestId('paste').props.focusable).toBe(true);
  });

  it('warns in development for text and host-primitive children', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      await render(
        <Menu trigger={{ content: 'Edit' }}>
          Loose text
          <Text>Host text</Text>
        </Menu>,
      );
      expect(warn).toHaveBeenCalledWith('Menu: compose only MenuItem rows and Dividers.');
    } finally {
      warn.mockRestore();
    }
  });
});

describe('menu navigation helpers', () => {
  const rows = [
    { id: 'cut', text: 'Cut', focusable: true },
    { id: 'copy', text: 'copy', focusable: true },
    { id: 'paste', text: 'Paste', focusable: false },
    { id: 'delete', text: 'Delete', focusable: true },
  ];

  it('finds the next focusable row by first character, wrapping and ignoring case', () => {
    expect(findTypeAheadRow(rows, null, 'c')?.id).toBe('cut');
    expect(findTypeAheadRow(rows, 'cut', 'C')?.id).toBe('copy');
    expect(findTypeAheadRow(rows, 'copy', 'c')?.id).toBe('cut');
    expect(findTypeAheadRow(rows, 'cut', 'p')).toBeUndefined();
  });

  it('reads only unmodified printable characters', () => {
    expect(getTypeAheadCharacter({ key: 'd' })).toBe('d');
    expect(getTypeAheadCharacter({ key: 'd', metaKey: true })).toBeUndefined();
    expect(getTypeAheadCharacter({ key: 'ArrowDown' })).toBeUndefined();
    expect(getTypeAheadCharacter({ key: ' ' })).toBeUndefined();
  });

  it('maps submenu arrows to layout direction', () => {
    expect(getInlineArrows(false)).toEqual({ open: 'ArrowRight', close: 'ArrowLeft' });
    expect(getInlineArrows(true)).toEqual({ open: 'ArrowLeft', close: 'ArrowRight' });
  });
});
