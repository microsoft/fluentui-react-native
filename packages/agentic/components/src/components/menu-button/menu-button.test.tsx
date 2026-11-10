/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { View } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { render } from '../../common/renderWithTheme';
import { MenuItem } from '../menu-item/menu-item';
import { MenuButton } from './menu-button';
import type { MenuButtonProps } from './menu-button.types';

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

function calloutHost(): ReactTestInstance {
  let node: ReactTestInstance | null = screen.getByTestId('menu');
  while (node && node.props.anchorMode === undefined) node = node.parent;
  if (!node) throw new Error('Missing native Callout host');
  return node;
}

function Scene(props: Partial<MenuButtonProps>) {
  return (
    <MenuButton content="New" testID="trigger" menu={{ testID: 'menu' }} {...props}>
      <MenuItem content="Message" secondaryContent={null} icon={null} testID="message" />
      <MenuItem content="Event" secondaryContent={null} icon={null} testID="event" />
    </MenuButton>
  );
}

function backgroundColor(node: ReactTestInstance): unknown {
  const styles = [node.props.style].flat(Infinity) as ({ backgroundColor?: unknown } | undefined)[];
  return styles.reduce<unknown>((color, style) => style?.backgroundColor ?? color, undefined);
}

describe('MenuButton', () => {
  beforeEach(() => dispatchCommand.mockClear());

  it.each((['small', 'medium', 'large'] as const).flatMap((size) => [false, true].map((iconOnly) => ({ size, iconOnly }))))(
    'MNB-002 preserves rounded content-layout metrics at $size with iconOnly=$iconOnly',
    async ({ size, iconOnly }) => {
      await render(
        <Scene
          size={size}
          content={iconOnly ? null : 'New'}
          accessibilityLabel="New"
          icon={{ imageSource: { uri: 'new.png' }, testID: 'leading-icon' }}
        />,
      );
      const { borderRadius, spacing } = defaultFlexTokens;
      expect(StyleSheet.flatten(screen.getByTestId('trigger').props.style)).toMatchObject({
        borderRadius: size === 'small' ? borderRadius.base200 : size === 'medium' ? borderRadius.base300 : borderRadius.base400,
        paddingHorizontal:
          size === 'small' ? spacing.componentBase200 : size === 'medium' ? spacing.componentBase250 : spacing.componentBase300,
        paddingVertical:
          size === 'small' ? spacing.componentBase100 : size === 'medium' ? spacing.componentBase150 : spacing.componentBase200,
      });
      const icon = screen.getByTestId('leading-icon');
      expect(icon.props.accessible).toBe(false);
      expect(StyleSheet.flatten(icon.props.style)).toMatchObject({ height: size === 'small' ? 16 : 20, width: size === 'small' ? 16 : 20 });
    },
  );

  it.each(['altKey', 'ctrlKey', 'metaKey', 'shiftKey'] as const)(
    'MNB-004 ignores modified opening keys with %s without presenting a menu',
    async (modifier) => {
      const onOpenChange = jest.fn();
      await render(<Scene onOpenChange={onOpenChange} />);
      for (const key of ['ArrowDown', 'ArrowUp']) {
        const event = { nativeEvent: { key, [modifier]: true } };
        await fireEvent(screen.getByTestId('trigger'), 'keyDown', event);
        expect(screen.queryByTestId('menu')).toBeNull();
      }
      expect(onOpenChange).not.toHaveBeenCalled();
    },
  );

  it('MNB-004 preserves the caller press event and controlled open ownership', async () => {
    const onPress = jest.fn();
    const onOpenChange = jest.fn();
    const { rerender } = await render(<Scene open={false} onPress={onPress} onOpenChange={onOpenChange} />);
    const event = { nativeEvent: { key: 'Enter' } };
    await fireEvent(screen.getByTestId('trigger'), 'press', event);
    expect(onPress.mock.calls).toEqual([[event]]);
    expect(onOpenChange.mock.calls).toEqual([[true, { reason: 'trigger' }]]);
    expect(screen.queryByTestId('menu')).toBeNull();
    expect(screen.getByTestId('trigger').props.accessibilityState.expanded).toBe(false);

    await rerender(<Scene open onPress={onPress} onOpenChange={onOpenChange} />);
    expect(screen.getByTestId('menu')).toBeOnTheScreen();
    expect(screen.getByTestId('trigger').props.accessibilityState.expanded).toBe(true);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders one button Pressable with the menu hint, expanded state, and a decorative chevron', async () => {
    const ref = React.createRef<View>();
    await render(<Scene ref={ref} />);
    const trigger = screen.getByTestId('trigger');
    expect(trigger.props.role).toBe('button');
    expect(trigger.props.accessibilityHint).toBe('Opens a menu');
    expect(trigger.props.accessibilityState).toMatchObject({ expanded: false });
    expect(trigger.props.accessibilityState.checked).toBeUndefined();
    expect(ref.current).not.toBeNull();
    expect(screen.queryByTestId('menu')).toBeNull();
  });

  it.each([
    { content: 'New', label: 'New' },
    { content: 0, label: '0' },
    { content: { children: 'Create' }, label: 'Create' },
    { content: { children: 0 }, label: '0' },
  ])('projects the plain content label $label onto the native trigger and menu', async ({ content, label }) => {
    await render(<Scene content={content} />);
    expect(screen.getByRole('button').props.accessibilityLabel).toBe(label);
    await fireEvent.press(screen.getByTestId('trigger'));
    expect(screen.getByTestId('menu').props.accessibilityLabel).toBe(label);
  });

  it.each([
    { props: { accessibilityLabel: 'Create document' }, label: 'Create document' },
    { props: { accessibilityLabel: '' }, label: '' },
    { props: { 'aria-label': 'Create document' }, label: 'Create document' },
    { props: { accessibilityLabelledBy: 'external-label' }, label: undefined },
    { props: { 'aria-labelledby': 'external-label' }, label: undefined },
    { props: { accessibilityLabel: 'Create document', accessibilityLabelledBy: 'external-label' }, label: 'Create document' },
  ] satisfies { props: Partial<MenuButtonProps>; label: string | undefined }[])(
    'preserves explicit native naming instead of using the visible content: $props',
    async ({ props, label }) => {
      await render(<Scene {...props} />);
      expect(screen.getByTestId('trigger').props.accessibilityLabel).toBe(label);
    },
  );

  it('updates the native name when the caller changes the plain content', async () => {
    const { rerender } = await render(<Scene />);
    expect(screen.getByRole('button').props.accessibilityLabel).toBe('New');
    await rerender(<Scene content="Insert" />);
    expect(screen.getByRole('button').props.accessibilityLabel).toBe('Insert');
  });

  it('opens on Down to the first row and on Up to the last row, below and start-aligned', async () => {
    const onOpenChange = jest.fn();
    await render(<Scene onOpenChange={onOpenChange} />);
    await fireEvent(screen.getByTestId('trigger'), 'keyDown', { nativeEvent: { key: 'ArrowDown' } });
    expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'trigger' });
    const host = calloutHost();
    expect(host.props.directionalHint).toBe('bottomLeftEdge');
    expect(host.props.tabNavigation).toBe('continue');
    expect(screen.getByTestId('menu').props.accessibilityLabel).toBe('New');
    await fireEvent(host, 'ready', { nativeEvent: { generation: host.props.commandGeneration } });
    expect(focusStrategies()).toEqual(['first']);

    await fireEvent(host, 'closed', { nativeEvent: { generation: host.props.commandGeneration, reason: 'escape' } });
    dispatchCommand.mockClear();
    await fireEvent(screen.getByTestId('trigger'), 'keyDown', { nativeEvent: { key: 'ArrowUp' } });
    const reopened = calloutHost();
    await fireEvent(reopened, 'ready', { nativeEvent: { generation: reopened.props.commandGeneration } });
    expect(focusStrategies()).toEqual(['last']);
  });

  it('draws the pressed chrome while the menu is presented', async () => {
    await render(<Scene />);
    const rest = backgroundColor(screen.getByTestId('trigger'));
    await fireEvent(screen.getByTestId('trigger'), 'press', { nativeEvent: { key: 'Enter' } });
    expect(screen.getByTestId('trigger').props.accessibilityState).toMatchObject({ expanded: true });
    expect(backgroundColor(screen.getByTestId('trigger'))).not.toEqual(rest);
  });

  it('never opens while disabled', async () => {
    const onOpenChange = jest.fn();
    await render(<Scene disabled defaultOpen onOpenChange={onOpenChange} />);
    expect(screen.queryByTestId('menu')).toBeNull();
    await fireEvent(screen.getByTestId('trigger'), 'keyDown', { nativeEvent: { key: 'ArrowDown' } });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId('menu')).toBeNull();
  });

  it('warns for a missing label and icon and for section-header rows', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      await render(
        <MenuButton accessibilityLabel="More">
          <MenuItem content="Group" menuStyle="section-header" />
        </MenuButton>,
      );
      expect(warn).toHaveBeenCalledWith('MenuButton: supply a label, a leading icon, or both.');
      expect(warn).toHaveBeenCalledWith('MenuButton: its menu is a flat list of actions; do not compose section headers.');
    } finally {
      warn.mockRestore();
    }
  });
});
