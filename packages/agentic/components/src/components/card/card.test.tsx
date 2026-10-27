/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Button } from '../button/button';
import { Card } from './card';

async function renderCard(props: React.ComponentProps<typeof Card>): Promise<RenderResult> {
  return render(<Card {...props} />);
}

function getRoot(component: RenderResult) {
  return component.getByTestId('card-root');
}

function getRootStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

describe('Card', () => {
  it.each([
    [undefined, false],
    [false, true],
    [true, true],
  ] as const)('CRD-001 derives overlay presence from selected=%s without requiring onPress', async (selected, interactive) => {
    const component = await renderCard({ selected, testID: 'card-root', accessibilityLabel: 'Report' });
    expect(getRoot(component).props.accessible).toBe(false);
    if (interactive) {
      expect(component.getByRole('button').props.accessibilityState).toEqual({ disabled: false, selected });
    } else {
      expect(component.queryByRole('button')).toBeNull();
      expect(getRoot(component).props.focusable).toBe(false);
    }
  });

  it.each([
    ['default', ['content']],
    ['nested', ['content', 'content02']],
    ['structured', ['header', 'content', 'content02', 'footer']],
  ] as const)('CRD-002 renders only the %s layout slots in order after the overlay', async (layout, expected) => {
    const component = await renderCard({
      accessibilityLabel: 'Report',
      layout,
      selected: false,
      testID: 'card-root',
      header: { testID: 'header' },
      content: { testID: 'content' },
      content02: { testID: 'content02' },
      footer: { testID: 'footer' },
    });
    const children = getRoot(component).children as { props: { testID?: string; accessibilityRole?: string } }[];
    expect(children[0].props.accessibilityRole).toBe('button');
    expect(children.slice(1).map((child) => child.props.testID)).toEqual(expected);
  });

  it('CRD-004 CRD-005 disables the overlay without disabling a nested action', async () => {
    const onPress = jest.fn();
    const onNestedPress = jest.fn();
    const component = await renderCard({
      accessibilityLabel: 'Unavailable report',
      disabled: true,
      selected: true,
      layout: 'structured',
      onPress,
      footer: { children: <Button content="Help" onPress={onNestedPress} /> },
    });
    const overlay = component.getByRole('button', { name: 'Unavailable report' });
    expect(overlay).toBeDisabled();
    expect(overlay.props.focusable).toBe(false);
    expect(overlay.props.accessibilityState.selected).toBe(true);
    await fireEvent.press(overlay);
    await fireEvent.press(component.getByRole('button', { name: 'Help' }));
    expect(onPress).not.toHaveBeenCalled();
    expect(onNestedPress).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('forwards its ref only to the structural native root', async () => {
    const ref = jest.fn<void, [React.ElementRef<typeof View> | null]>();

    await renderCard({
      accessibilityLabel: 'Open report',
      content: { children: <Text>Report</Text> },
      onPress: jest.fn(),
      ref,
      testID: 'card-root',
    });

    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(expect.anything());
  });

  it('renders selection without changing it on press', async () => {
    const onPress = jest.fn();
    const component = await renderCard({ accessibilityLabel: 'Report', onPress, selected: false });

    await fireEvent.press(component.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(component.getByRole('button').props.accessibilityState.selected).toBe(false);
  });

  it('preserves an explicitly nonfocusable overlay without disabling pointer activation', async () => {
    const onPress = jest.fn();
    const component = await renderCard({ accessibilityLabel: 'Report', focusable: false, onPress });
    const overlay = component.getByRole('button');

    expect(overlay.props.focusable).toBe(false);
    await fireEvent.press(overlay);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the default surface and content', async () => {
    const component = await renderCard({
      content: {
        children: <Text>Summary</Text>,
      },
      testID: 'card-root',
    });
    const colors = defaultFlexTokens.color;

    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: colors.surfaceNeutralTranslucent,
      borderColor: colors.strokeNeutralSubtle,
    });
    expect(component.getByText('Summary')).toBeOnTheScreen();
  });

  it('exposes static group semantics when explicitly requested', async () => {
    const component = await renderCard({
      accessible: true,
      content: {
        children: <Text>Overview</Text>,
      },
      testID: 'card-root',
      accessibilityLabel: 'Overview',
    });

    expect(component.getByRole('group', { name: 'Overview' })).toBeOnTheScreen();
  });

  it('renders selected colors and hover, press, and focus feedback', async () => {
    const component = await renderCard({
      accessibilityLabel: 'Open report',
      content: {
        children: <Text>Report summary</Text>,
      },
      onPress: jest.fn(),
      selected: true,
      testID: 'card-root',
    });
    const colors = defaultFlexTokens.color;
    const button = component.getByRole('button', { name: 'Open report' });

    expect(button.props.accessibilityState).toEqual({ disabled: false, selected: true });
    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: colors.backgroundNeutralSoft,
      borderColor: colors.strokeNeutralSoft,
    });

    await fireEvent(button, 'hoverIn', {});
    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: colors.hover.backgroundNeutralSoft,
      borderColor: colors.hover.strokeNeutralSoft,
    });

    await fireEvent(button, 'pressIn', {});
    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: colors.pressed.backgroundNeutralSoft,
      borderColor: colors.pressed.strokeNeutralSoft,
    });

    await fireEvent(button, 'focus', {});
    expect(button.props.enableFocusRing).toBe(true);
    expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
  });

  it('keeps nested footer buttons independent from the card surface', async () => {
    const onCardPress = jest.fn();
    const onFooterPress = jest.fn();
    const component = await renderCard({
      accessibilityLabel: 'Open report',
      content: {
        children: <Text>Quarterly summary</Text>,
      },
      footer: {
        children: <Button accessibilityLabel="Edit report" content="Edit" onPress={onFooterPress} />,
      },
      layout: 'structured',
      onPress: onCardPress,
      testID: 'card-root',
      header: {
        children: <Text>Q3 report</Text>,
      },
    });

    await fireEvent.press(component.getByRole('button', { name: 'Edit report' }));

    expect(onFooterPress).toHaveBeenCalledTimes(1);
    expect(onCardPress).not.toHaveBeenCalled();
  });

  it('renders nested content with the expected inner radius', async () => {
    const component = await renderCard({
      content: {
        children: <Text>Primary</Text>,
      },
      content02: {
        children: <View />,
        testID: 'nested-content',
      },
      layout: 'nested',
      padding: 'default',
      size: 'large',
      testID: 'card-root',
    });

    expect(StyleSheet.flatten(component.getByTestId('nested-content').props.style)).toMatchObject({
      borderRadius: defaultFlexTokens.borderRadius.base400,
    });
  });

  it('preserves consumer accessibility state values', async () => {
    const component = await renderCard({
      accessibilityLabel: 'Open report',
      accessibilityState: { busy: true },
      content: {
        children: <Text>Report summary</Text>,
      },
      onPress: jest.fn(),
      testID: 'card-root',
    });

    expect(component.getByRole('button', { name: 'Open report' }).props.accessibilityState).toEqual({
      busy: true,
      disabled: false,
    });
  });
});
