/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, Text as NativeText } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { act, fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Tooltip } from './tooltip';

const label = 'Refresh the list from the server';

function renderTooltip(props: Partial<React.ComponentProps<typeof Tooltip>> = {}): Promise<RenderResult> {
  return render(<Tooltip content={label} {...props} />);
}

function getTrigger(component: RenderResult) {
  return component.getByTestId('tooltip-trigger');
}

function getSurfaceContentStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(component.getByTestId('tooltip-surface-content').props.style);
}

function getContentStyle(component: RenderResult): TextStyle {
  return StyleSheet.flatten(component.getByTestId('tooltip-content').props.style);
}

async function advance(ms: number): Promise<void> {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

describe('Tooltip', () => {
  beforeEach(() => {
    // React's act scheduling relies on real microtask delivery, so only the timer functions the delays use are faked.
    jest.useFakeTimers({ doNotFake: ['nextTick', 'performance', 'queueMicrotask'] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders only the trigger while hidden and describes it with the label', async () => {
    const component = await renderTooltip();
    const trigger = getTrigger(component);

    expect(trigger.props.accessibilityRole).toBe('button');
    expect(trigger.props.accessibilityHint).toBe(label);
    expect(trigger.props.accessibilityState).toEqual({ disabled: false });
    expect(trigger.props.accessible).toBe(true);
    expect(trigger.props.focusable).toBe(true);
    expect(trigger.props.enableFocusRing).toBe(false);
    expect(component.queryByTestId('tooltip-surface')).toBeNull();
    expect(component.queryByTestId('tooltip-surface-content')).toBeNull();
    expect(component.queryByTestId('tooltip-content')).toBeNull();
  });

  it('never reports expanded state on the trigger', async () => {
    const component = await renderTooltip({ defaultVisible: true });
    const trigger = getTrigger(component);

    // Pressable folds `aria-expanded` into `accessibilityState`, so an undefined value here also proves the
    // Popover-owned expanded reporting was removed rather than merely renamed.
    expect(trigger.props.accessibilityState.expanded).toBeUndefined();
    expect(component.getByTestId('tooltip-surface')).toBeOnTheScreen();
  });

  it('reveals the tooltip only after the show delay elapses', async () => {
    const onVisibleChange = jest.fn();
    const component = await renderTooltip({ onVisibleChange });

    await fireEvent(getTrigger(component), 'hoverIn', {});
    await advance(299);

    expect(onVisibleChange).not.toHaveBeenCalled();
    expect(component.queryByTestId('tooltip-surface')).toBeNull();

    await advance(1);

    expect(onVisibleChange).toHaveBeenCalledWith(true);
    expect(component.getByTestId('tooltip-surface')).toBeOnTheScreen();
    expect(component.getByText(label)).toBeOnTheScreen();
  });

  it('honors a custom show delay and a custom hide delay', async () => {
    const component = await renderTooltip({ hideDelay: 200, showDelay: 50 });
    const trigger = getTrigger(component);

    await fireEvent(trigger, 'hoverIn', {});
    await advance(50);

    expect(component.getByTestId('tooltip-surface')).toBeOnTheScreen();

    await fireEvent(trigger, 'hoverOut', {});
    await advance(199);

    expect(component.getByTestId('tooltip-surface')).toBeOnTheScreen();

    await advance(1);

    expect(component.queryByTestId('tooltip-surface')).toBeNull();
  });

  it('cancels a pending reveal when the pointer leaves before the delay elapses', async () => {
    const onVisibleChange = jest.fn();
    const component = await renderTooltip({ onVisibleChange });
    const trigger = getTrigger(component);

    await fireEvent(trigger, 'hoverIn', {});
    await advance(100);
    await fireEvent(trigger, 'hoverOut', {});
    await advance(1000);

    expect(onVisibleChange).not.toHaveBeenCalled();
    expect(component.queryByTestId('tooltip-surface')).toBeNull();
  });

  it('reveals the tooltip immediately on focus and hides it on blur', async () => {
    const onVisibleChange = jest.fn();
    const component = await renderTooltip({ onVisibleChange });
    const trigger = getTrigger(component);

    await fireEvent(trigger, 'focus', {});

    expect(onVisibleChange).toHaveBeenCalledWith(true);
    expect(component.getByTestId('tooltip-surface')).toBeOnTheScreen();

    await fireEvent(trigger, 'blur', {});

    expect(onVisibleChange).toHaveBeenLastCalledWith(false);
    expect(component.queryByTestId('tooltip-surface')).toBeNull();
  });

  it('keeps the tooltip visible while either the pointer or focus remains on the trigger', async () => {
    const component = await renderTooltip();
    const trigger = getTrigger(component);

    await fireEvent(trigger, 'hoverIn', {});
    await advance(300);
    await fireEvent(trigger, 'focus', {});
    await fireEvent(trigger, 'hoverOut', {});

    expect(component.getByTestId('tooltip-surface')).toBeOnTheScreen();

    await fireEvent(trigger, 'blur', {});

    expect(component.queryByTestId('tooltip-surface')).toBeNull();
  });

  it('cancels a pending hide when the interaction returns to the trigger', async () => {
    const component = await renderTooltip({ hideDelay: 400, showDelay: 0 });
    const trigger = getTrigger(component);

    await fireEvent(trigger, 'hoverIn', {});
    await fireEvent(trigger, 'hoverOut', {});
    await advance(200);
    await fireEvent(trigger, 'hoverIn', {});
    await advance(1000);

    expect(component.getByTestId('tooltip-surface')).toBeOnTheScreen();

    await fireEvent(trigger, 'hoverOut', {});
    await advance(200);
    await fireEvent(trigger, 'focus', {});
    await advance(1000);

    expect(component.getByTestId('tooltip-surface')).toBeOnTheScreen();
  });

  it('cancels a pending reveal when the component unmounts', async () => {
    const onVisibleChange = jest.fn();
    const component = await renderTooltip({ onVisibleChange });

    await fireEvent(getTrigger(component), 'hoverIn', {});
    await component.unmount();
    await advance(1000);

    expect(onVisibleChange).not.toHaveBeenCalled();
  });

  it('does not reveal the tooltip from a disabled trigger', async () => {
    const onVisibleChange = jest.fn();
    const component = await renderTooltip({ disabled: true, onVisibleChange });
    const trigger = getTrigger(component);

    expect(trigger.props.accessibilityState).toEqual({ disabled: true });
    expect(trigger.props.focusable).toBe(false);

    await fireEvent(trigger, 'hoverIn', {});
    await advance(1000);
    await fireEvent(trigger, 'focus', {});

    expect(onVisibleChange).not.toHaveBeenCalled();
    expect(component.queryByTestId('tooltip-surface')).toBeNull();
  });

  it('drops a pending pointer reveal when the trigger is disabled before the delay elapses', async () => {
    const onVisibleChange = jest.fn();
    const component = await render(<Tooltip content={label} onVisibleChange={onVisibleChange} showDelay={100} />);
    const trigger = getTrigger(component);

    await fireEvent(trigger, 'hoverIn', {});
    await advance(50);

    await component.rerender(<Tooltip content={label} disabled onVisibleChange={onVisibleChange} showDelay={100} />);
    await advance(100);

    expect(onVisibleChange).not.toHaveBeenCalled();
    expect(component.queryByTestId('tooltip-surface')).toBeNull();
    expect(component.queryByTestId('tooltip-surface-content')).toBeNull();
  });

  it('lets native dismissal hide a visible tooltip whose trigger is disabled', async () => {
    const onVisibleChange = jest.fn();
    const component = await renderTooltip({ defaultVisible: true, disabled: true, onVisibleChange });

    await fireEvent(component.getByTestId('tooltip-surface'), 'dismiss');

    expect(onVisibleChange).toHaveBeenCalledWith(false);
    expect(component.queryByTestId('tooltip-surface')).toBeNull();
  });

  it('hides on native dismissal without reopening from the pending pointer timer', async () => {
    const component = await renderTooltip({ hideDelay: 0, showDelay: 100 });
    const trigger = getTrigger(component);

    await fireEvent(trigger, 'hoverIn', {});
    await advance(100);
    await fireEvent(trigger, 'hoverIn', {});
    await fireEvent(component.getByTestId('tooltip-surface'), 'dismiss');
    await advance(1000);

    expect(component.queryByTestId('tooltip-surface')).toBeNull();
  });

  it('treats trigger activation as a request to hide and never as a request to reveal', async () => {
    const onPress = jest.fn();
    const onVisibleChange = jest.fn();
    const component = await renderTooltip({ onVisibleChange, trigger: { onPress } });

    await fireEvent.press(getTrigger(component));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onVisibleChange).not.toHaveBeenCalled();
    expect(component.queryByTestId('tooltip-surface')).toBeNull();

    await fireEvent(getTrigger(component), 'focus', {});
    onVisibleChange.mockClear();
    await fireEvent.press(getTrigger(component));

    expect(onVisibleChange).toHaveBeenCalledWith(false);
    expect(component.queryByTestId('tooltip-surface')).toBeNull();
  });

  it('reports requests without changing an externally driven visible value', async () => {
    const onVisibleChange = jest.fn();
    const component = await renderTooltip({ onVisibleChange, visible: false });

    await fireEvent(getTrigger(component), 'focus', {});

    expect(onVisibleChange).toHaveBeenCalledWith(true);
    expect(component.queryByTestId('tooltip-surface')).toBeNull();

    const shown = await renderTooltip({ onVisibleChange, visible: true });
    onVisibleChange.mockClear();

    await fireEvent(shown.getByTestId('tooltip-surface'), 'dismiss');

    expect(onVisibleChange).toHaveBeenCalledWith(false);
    expect(shown.getByTestId('tooltip-surface')).toBeOnTheScreen();
  });

  it('anchors above the trigger by default and never asks the surface for initial focus', async () => {
    const component = await renderTooltip({ defaultVisible: true });
    const surface = component.getByTestId('tooltip-surface');

    expect(surface.props.directionalHint).toBe('topCenter');
    expect(surface.props.setInitialFocus).toBe(false);
  });

  it('forwards a requested preferred placement to the native surface', async () => {
    const component = await renderTooltip({ defaultVisible: true, position: 'bottomCenter' });

    expect(component.getByTestId('tooltip-surface').props.directionalHint).toBe('bottomCenter');
  });

  it('names the surface content host with the label and gives it the tooltip role', async () => {
    const component = await renderTooltip({ defaultVisible: true });
    const surfaceContent = component.getByTestId('tooltip-surface-content');

    expect(surfaceContent.props.role).toBe('tooltip');
    expect(surfaceContent.props.accessibilityRole).toBeUndefined();
    expect(surfaceContent.props.accessibilityLabel).toBe(label);
  });

  it('draws the label surface and its typography from Flex tokens', async () => {
    const tokens = defaultFlexTokens;
    const component = await renderTooltip({ defaultVisible: true });

    expect(getSurfaceContentStyle(component)).toMatchObject({
      backgroundColor: tokens.color.surfaceNeutralNearer,
      borderRadius: tokens.borderRadius.base200,
      overflow: 'hidden',
      paddingHorizontal: tokens.spacing.componentBase200,
      paddingVertical: tokens.spacing.componentBase100,
    });
    expect(getSurfaceContentStyle(component)).not.toHaveProperty('borderWidth');
    expect(getContentStyle(component)).toMatchObject({
      color: tokens.color.foregroundNeutralPrimary,
      fontFamily: tokens.fontFamily.functional,
      fontSize: tokens.fontSize.functionalBodySmall,
      fontWeight: tokens.fontWeight.functionalRegular,
      lineHeight: tokens.lineHeight.functionalBodySmall,
    });
  });

  it('passes a stroke-free surface appearance to the native callout', async () => {
    const tokens = defaultFlexTokens;
    const component = await renderTooltip({ defaultVisible: true });

    expect(StyleSheet.flatten(component.getByTestId('tooltip-surface').props.style)).toMatchObject({
      backgroundColor: tokens.color.surfaceNeutralNearer,
      borderColor: tokens.color.surfaceNeutralNearer,
      borderRadius: tokens.borderRadius.base200,
      borderWidth: 0,
    });
  });

  it('renders the dual-ring trigger focus visual from the focused prop', async () => {
    const component = await renderTooltip({ focused: true });

    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: defaultFlexTokens.color.strokeFocusOuter,
      borderWidth: defaultFlexTokens.strokeWidth.thick,
    });
    expect(StyleSheet.flatten(component.getByTestId('focus-visual-inner', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: defaultFlexTokens.color.strokeFocusInner,
      borderWidth: defaultFlexTokens.strokeWidth.thin,
    });
  });

  it('renders trigger presentation and runs consumer pointer and focus handlers after its own', async () => {
    const onFocus = jest.fn();
    const onHoverIn = jest.fn();
    const onHoverOut = jest.fn();
    const component = await renderTooltip({
      trigger: { children: <NativeText>Refresh</NativeText>, onFocus, onHoverIn, onHoverOut, style: { width: 120 } },
    });
    const trigger = getTrigger(component);

    expect(component.getByText('Refresh')).toBeOnTheScreen();
    expect(StyleSheet.flatten(trigger.props.style)).toMatchObject({ flexDirection: 'row', width: 120 });

    await fireEvent(trigger, 'hoverIn', {});
    await fireEvent(trigger, 'hoverOut', {});
    await fireEvent(trigger, 'focus', {});

    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(onHoverOut).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(component.getByTestId('tooltip-surface')).toBeOnTheScreen();
  });

  it('accepts a consumer trigger role for a trigger that is not a button', async () => {
    const component = await renderTooltip({ trigger: { accessibilityRole: 'image' } });

    expect(getTrigger(component).props.accessibilityRole).toBe('image');
  });

  it('preserves a consumer trigger test identifier', async () => {
    const component = await renderTooltip({ trigger: { testID: 'refresh-trigger' } });

    expect(component.getByTestId('refresh-trigger')).toBeOnTheScreen();
    expect(component.queryByTestId('tooltip-trigger')).toBeNull();
  });

  it('gives a consumer trigger ref the same host instance the anchor uses', async () => {
    const triggerRef = React.createRef<unknown>();
    const component = await renderTooltip({ trigger: { ref: triggerRef as never } });

    expect(triggerRef.current).not.toBeNull();
    expect((triggerRef.current as { props: { testID?: string } }).props.testID).toBe('tooltip-trigger');
    expect(component.getByTestId('tooltip-trigger')).toBeOnTheScreen();
  });

  it('accepts label slot properties and applies a user label style last', async () => {
    const component = await renderTooltip({
      content: { children: label, style: { fontSize: 30 }, testID: 'refresh-label' },
      defaultVisible: true,
    });

    expect(component.getByTestId('refresh-label')).toBeOnTheScreen();
    expect(StyleSheet.flatten(component.getByTestId('refresh-label').props.style)).toMatchObject({
      color: defaultFlexTokens.color.foregroundNeutralPrimary,
      fontSize: 30,
    });
  });

  it('keeps unrelated consumer accessibility state and applies user root styles last', async () => {
    const component = await renderTooltip({
      accessibilityState: { busy: true },
      style: { width: 240 },
      testID: 'tooltip-root',
    });

    expect(getTrigger(component).props.accessibilityState).toEqual({ busy: true, disabled: false });
    expect(component.getByTestId('tooltip-root').props.accessible).toBe(false);
    expect(StyleSheet.flatten(component.getByTestId('tooltip-root').props.style)).toMatchObject({
      alignSelf: 'flex-start',
      width: 240,
    });
  });

  it('warns in development when the label is not a usable string', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await renderTooltip({ content: '' });

    expect(warn).toHaveBeenCalledWith('Tooltip: content must be a non-empty string because it also describes the trigger.');
    warn.mockRestore();
  });
});
