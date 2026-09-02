/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewProps, ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';
import { directComponent } from '@fluentui-react-native/framework-base';

import { Popover } from './popover';

const label = 'Sync details';

function renderPopover(props: Partial<React.ComponentProps<typeof Popover>> = {}): Promise<RenderResult> {
  return render(<Popover surfaceAccessibilityLabel={label} {...props} />);
}

function getTrigger(component: RenderResult) {
  return component.getByTestId('popover-trigger');
}

function getSurfaceStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(component.getByTestId('popover-surface-content').props.style);
}

describe('Popover', () => {
  it('renders only the trigger while closed', async () => {
    const component = await renderPopover();
    const trigger = getTrigger(component);

    expect(trigger.props.accessibilityRole).toBe('button');
    expect(trigger.props.accessibilityState).toEqual({ disabled: false, expanded: false });
    expect(trigger.props.accessible).toBe(true);
    expect(trigger.props.focusable).toBe(true);
    expect(component.queryByTestId('popover-surface')).toBeNull();
    expect(component.queryByTestId('popover-surface-content')).toBeNull();
    expect(component.queryByTestId('popover-content')).toBeNull();
  });

  it('mounts the anchored surface and the placeholder content on press', async () => {
    const onOpenChange = jest.fn();
    const component = await renderPopover({ onOpenChange });

    await fireEvent.press(getTrigger(component));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(getTrigger(component).props.accessibilityState.expanded).toBe(true);
    expect(component.getByTestId('popover-surface')).toBeOnTheScreen();
    expect(component.getByTestId('popover-content')).toBeOnTheScreen();
    expect(component.getByText('Popover content')).toBeOnTheScreen();
  });

  it('starts from defaultOpen and closes again on press', async () => {
    const onOpenChange = jest.fn();
    const component = await renderPopover({ defaultOpen: true, onOpenChange });

    expect(component.getByTestId('popover-surface')).toBeOnTheScreen();

    await fireEvent.press(getTrigger(component));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(component.queryByTestId('popover-surface')).toBeNull();
  });

  it('reports presses without changing state when the open value is externally driven', async () => {
    const onOpenChange = jest.fn();
    const component = await renderPopover({ onOpenChange, open: false });

    await fireEvent.press(getTrigger(component));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(component.queryByTestId('popover-surface')).toBeNull();
    expect(getTrigger(component).props.accessibilityState.expanded).toBe(false);
  });

  it('closes an uncontrolled popover when the native surface dismisses', async () => {
    const onOpenChange = jest.fn();
    const component = await renderPopover({ defaultOpen: true, onOpenChange });

    await fireEvent(component.getByTestId('popover-surface'), 'dismiss');

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(component.queryByTestId('popover-surface')).toBeNull();
  });

  it('allows native dismissal to close an open disabled popover', async () => {
    const onOpenChange = jest.fn();
    const component = await renderPopover({ defaultOpen: true, disabled: true, onOpenChange });

    await fireEvent(component.getByTestId('popover-surface'), 'dismiss');

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(component.queryByTestId('popover-surface')).toBeNull();
    expect(getTrigger(component).props.accessibilityState.expanded).toBe(false);
  });

  it('reports native dismissal without changing an externally driven open value', async () => {
    const onOpenChange = jest.fn();
    const component = await renderPopover({ onOpenChange, open: true });

    await fireEvent(component.getByTestId('popover-surface'), 'dismiss');

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(component.getByTestId('popover-surface')).toBeOnTheScreen();
  });

  it('does not open from a disabled trigger', async () => {
    const onOpenChange = jest.fn();
    const component = await renderPopover({ disabled: true, onOpenChange });

    expect(getTrigger(component).props.accessibilityState).toEqual({ disabled: true, expanded: false });
    expect(getTrigger(component).props.focusable).toBe(false);

    await fireEvent.press(getTrigger(component));

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(component.queryByTestId('popover-surface')).toBeNull();
  });

  it('forwards the preferred placement to the native surface', async () => {
    const component = await renderPopover({ defaultOpen: true, position: 'topRightEdge' });

    expect(component.getByTestId('popover-surface').props.directionalHint).toBe('topRightEdge');
  });

  it('defaults to the placement both platforms produce below the anchor', async () => {
    const component = await renderPopover({ defaultOpen: true });

    expect(component.getByTestId('popover-surface').props.directionalHint).toBe('bottomLeftEdge');
  });

  it('names the floating surface separately from the trigger', async () => {
    const component = await renderPopover({
      defaultOpen: true,
      trigger: { accessibilityLabel: 'Open sync details' },
    });

    expect(getTrigger(component).props.accessibilityLabel).toBe('Open sync details');
    expect(component.getByTestId('popover-surface-content').props.accessibilityLabel).toBe(label);
    expect(component.getByTestId('popover-surface-content').props.accessibilityRole).toBe('dialog');
  });

  it('warns in development when the floating surface has no name', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await render(<Popover />);

    expect(warn).toHaveBeenCalledWith('Popover: provide a surfaceAccessibilityLabel to name the floating surface.');
    warn.mockRestore();
  });

  it('draws the whole surface boundary from Flex tokens on the content host', async () => {
    const tokens = defaultFlexTokens;
    const component = await renderPopover({ defaultOpen: true });

    expect(getSurfaceStyle(component)).toMatchObject({
      backgroundColor: tokens.color.surfaceNeutralNearer,
      borderColor: tokens.color.strokeNeutralSubtle,
      borderRadius: tokens.borderRadius.base400,
      borderWidth: tokens.strokeWidth.thin,
      overflow: 'hidden',
      padding: tokens.spacing.componentBase400,
    });
  });

  it('renders the dual-ring trigger focus visual from the focused prop', async () => {
    const component = await renderPopover({ focused: true });

    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: defaultFlexTokens.color.strokeFocusOuter,
      borderWidth: defaultFlexTokens.strokeWidth.thick,
    });
    expect(StyleSheet.flatten(component.getByTestId('focus-visual-inner', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: defaultFlexTokens.color.strokeFocusInner,
      borderWidth: defaultFlexTokens.strokeWidth.thin,
    });
  });

  it('renders trigger presentation and composes a consumer press handler after the toggle', async () => {
    const onPress = jest.fn();
    const component = await renderPopover({
      trigger: { children: <Text>Details</Text>, onPress, style: { width: 120 } },
    });

    expect(component.getByText('Details')).toBeOnTheScreen();
    expect(StyleSheet.flatten(getTrigger(component).props.style)).toMatchObject({ flexDirection: 'row', width: 120 });

    await fireEvent.press(getTrigger(component));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(component.getByTestId('popover-surface')).toBeOnTheScreen();
  });

  it('preserves a consumer trigger test identifier', async () => {
    const component = await renderPopover({ trigger: { testID: 'sync-trigger' } });

    expect(component.getByTestId('sync-trigger')).toBeOnTheScreen();
    expect(component.queryByTestId('popover-trigger')).toBeNull();
  });

  it('gives a consumer trigger ref the same host instance the anchor uses', async () => {
    const triggerRef = React.createRef<unknown>();
    const component = await renderPopover({ trigger: { ref: triggerRef as never } });

    expect(triggerRef.current).not.toBeNull();
    expect((triggerRef.current as { props: { testID?: string } }).props.testID).toBe('popover-trigger');
    expect(component.getByTestId('popover-trigger')).toBeOnTheScreen();
  });

  it('tracks focus on the trigger by toggling the focus ring visibility', async () => {
    const component = await renderPopover({});
    const trigger = getTrigger(component);
    const ring = () => StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style);

    expect(ring()).toMatchObject({ opacity: 0 });

    await fireEvent(trigger, 'focus', {});

    expect(ring()).not.toHaveProperty('opacity');

    await fireEvent(trigger, 'blur', {});

    expect(ring()).toMatchObject({ opacity: 0 });
  });

  it('renders a custom content slot and an empty surface for a null content slot', async () => {
    const CustomContent = directComponent<ViewProps>((props) => <View {...props} accessibilityHint="custom-content" />);
    const custom = await renderPopover({
      content: { as: CustomContent, children: <Text>Last synced 5 minutes ago.</Text>, testID: 'custom-content' },
      defaultOpen: true,
    });

    expect(custom.getByTestId('custom-content').props.accessibilityHint).toBe('custom-content');
    expect(custom.getByText('Last synced 5 minutes ago.')).toBeOnTheScreen();
    expect(custom.queryByText('Popover content')).toBeNull();

    const empty = await renderPopover({ content: null, defaultOpen: true });

    expect(empty.getByTestId('popover-surface-content')).toBeOnTheScreen();
    expect(empty.queryByTestId('popover-content')).toBeNull();
    expect(empty.queryByText('Popover content')).toBeNull();
  });

  it('keeps unrelated consumer accessibility state and applies user root styles last', async () => {
    const component = await renderPopover({
      accessibilityState: { busy: true },
      style: { width: 240 },
      testID: 'popover-root',
    });

    expect(getTrigger(component).props.accessibilityState).toEqual({ busy: true, disabled: false, expanded: false });
    expect(StyleSheet.flatten(component.getByTestId('popover-root').props.style)).toMatchObject({
      alignSelf: 'flex-start',
      width: 240,
    });
    expect(component.getByTestId('popover-root').props.accessible).toBe(false);
  });
});
