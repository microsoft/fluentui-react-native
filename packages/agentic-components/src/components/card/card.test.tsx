/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { useFlexTokens } from '@fluentui-react-native/design';

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

  it('toggles its own selection when selection is internally driven', async () => {
    const onSelectedChange = jest.fn();
    const onPress = jest.fn();
    const component = await renderCard({ accessibilityLabel: 'Report', defaultSelected: false, onPress, onSelectedChange });

    await fireEvent.press(component.getByRole('button'));

    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(component.getByRole('button').props.accessibilityState.selected).toBe(true);

    await fireEvent.press(component.getByRole('button'));

    expect(onSelectedChange).toHaveBeenLastCalledWith(false);
    expect(component.getByRole('button').props.accessibilityState.selected).toBe(false);
  });

  it('reports presses without changing state when selection is externally driven', async () => {
    const onSelectedChange = jest.fn();
    const component = await renderCard({ accessibilityLabel: 'Report', onSelectedChange, selected: false });

    await fireEvent.press(component.getByRole('button'));

    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(component.getByRole('button').props.accessibilityState.selected).toBe(false);
  });

  it('renders the default surface and content', async () => {
    const component = await renderCard({
      content: {
        children: <Text>Summary</Text>,
      },
      testID: 'card-root',
    });
    const colors = useFlexTokens().color;

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
    const colors = useFlexTokens().color;
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
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({
      borderColor: colors.strokeFocusInner,
      outlineColor: colors.strokeFocusOuter,
      outlineOffset: 1,
      outlineStyle: 'solid',
      outlineWidth: 2,
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
      borderRadius: useFlexTokens().borderRadius.base400,
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
