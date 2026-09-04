/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
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

  it('keeps the root test ID and adds a stable ID to the interactive overlay', async () => {
    const component = await renderCard({
      accessibilityLabel: 'Open report',
      content: { children: <Text>Report</Text> },
      onPress: jest.fn(),
      testID: 'card-root',
    });

    expect(component.getByTestId('card-root')).toBeOnTheScreen();
    expect(component.getByTestId('card-root-interactive')).toBeOnTheScreen();
  });

  it('renders selection without changing it on press', async () => {
    const onPress = jest.fn();
    const component = await renderCard({ accessibilityLabel: 'Report', onPress, selected: false });

    await fireEvent.press(component.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(component.getByRole('button').props.accessibilityState.selected).toBe(false);
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
    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: colors.strokeFocusOuter,
      borderWidth: 2,
    });
    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).not.toHaveProperty(
      'opacity',
    );
    expect(StyleSheet.flatten(component.getByTestId('focus-visual-inner', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: colors.strokeFocusInner,
      borderWidth: 1,
    });
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
