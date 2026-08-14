/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { useFlexTokens } from '@fluentui-react-native/design';

import { Tab } from './tab';

function renderTab(props: React.ComponentProps<typeof Tab>): Promise<RenderResult> {
  return render(<Tab {...props} />);
}

function getRoot(component: RenderResult) {
  return component.getByRole('tab');
}

function getRootStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

describe('Tab', () => {
  it('renders default icon-and-text accessibility and stable label overlay', async () => {
    const component = await renderTab({ controls: 'files-panel', content: 'Files' });
    const root = getRoot(component);
    const labels = component.getAllByText('Files', { includeHiddenElements: true });
    const tokens = useFlexTokens();

    expect(root.props.accessibilityRole).toBe('tab');
    expect(root.props.accessibilityControls).toBe('files-panel');
    expect(root.props.accessibilityState).toEqual({ disabled: false, selected: false });
    expect(root.props.focusable).toBe(true);
    expect(labels).toHaveLength(2);
    expect(StyleSheet.flatten(labels[0].props.style)).toMatchObject({ fontWeight: tokens.fontWeight.functionalSemibold, opacity: 0 });
    expect(StyleSheet.flatten(labels[1].props.style)).toMatchObject({
      fontWeight: tokens.fontWeight.functionalRegular,
      position: 'absolute',
    });
    expect(getRootStyle(component)).toMatchObject({
      alignItems: 'center',
      backgroundColor: tokens.color.backgroundNeutralTransparent,
      borderRadius: tokens.borderRadius.base300,
      gap: tokens.spacing.componentBase100,
      paddingHorizontal: tokens.spacing.componentBase300,
      paddingVertical: tokens.spacing.componentBase150,
    });
  });

  it('maps the controls prop to native accessibility controls', async () => {
    const component = await renderTab({ controls: 'settings-panel', content: 'Settings' });
    expect(getRoot(component).props.accessibilityControls).toBe('settings-panel');
  });

  it('forwards handlers while updating selected interaction state', async () => {
    const onHoverIn = jest.fn();
    const onPress = jest.fn();
    const component = await renderTab({ controls: 'files-panel', content: 'Files', onHoverIn, onPress, selected: true });
    const root = getRoot(component);
    const colors = useFlexTokens().color;

    expect(getRootStyle(component).backgroundColor).toBe(colors.backgroundNeutralHeavy);
    await fireEvent(root, 'hoverIn', {});
    expect(getRootStyle(component).backgroundColor).toBe(colors.hover.backgroundNeutralHeavy);
    await fireEvent(root, 'pressIn', {});
    expect(getRootStyle(component).backgroundColor).toBe(colors.pressed.backgroundNeutralHeavy);
    await fireEvent.press(root);
    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses a semibold ghost and visible label when selected', async () => {
    const component = await renderTab({ controls: 'files-panel', content: 'Files', selected: true });
    const labels = component.getAllByText('Files', { includeHiddenElements: true });
    const tokens = useFlexTokens();

    expect(labels).toHaveLength(2);
    expect(StyleSheet.flatten(labels[0].props.style)).toMatchObject({
      fontWeight: tokens.fontWeight.functionalSemibold,
      opacity: 0,
    });
    expect(StyleSheet.flatten(labels[1].props.style)).toMatchObject({
      fontWeight: tokens.fontWeight.functionalSemibold,
      position: 'absolute',
    });
  });

  it('exposes selected and disabled accessibility state', async () => {
    const component = await renderTab({ controls: 'archive-panel', content: 'Archive', disabled: true, selected: true });
    const root = getRoot(component);

    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ disabled: true, selected: true });
    expect(getRootStyle(component).backgroundColor).toBe(useFlexTokens().color.backgroundNeutralHeavyDisabled);
  });

  it('renders icon-only tabs with icon swap and accessible labels', async () => {
    const component = await renderTab({
      accessibilityLabel: 'Settings',
      controls: 'settings-panel',
      icon: { fontSource: { codepoint: 0x2606, fontFamily: 'Arial' }, testID: 'regular-icon' },
      layout: 'iconOnly',
      selectedIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'filled-icon' },
    });
    const root = getRoot(component);

    expect(root.props.accessibilityLabel).toBe('Settings');
    expect(getRootStyle(component)).toMatchObject({
      borderRadius: useFlexTokens().borderRadius.circular,
      paddingHorizontal: useFlexTokens().spacing.componentBase150,
      paddingVertical: useFlexTokens().spacing.componentBase150,
    });
    expect(component.getByTestId('regular-icon').props.testID).toBe('regular-icon');
    expect(component.queryByTestId('filled-icon')).toBeNull();
  });

  it('swaps to the filled icon and selected label weight when selected', async () => {
    const component = await renderTab({
      accessibilityLabel: 'Settings',
      controls: 'settings-panel',
      icon: { fontSource: { codepoint: 0x2606, fontFamily: 'Arial' }, testID: 'regular-icon' },
      layout: 'iconOnly',
      selected: true,
      selectedIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'filled-icon' },
    });

    expect(component.queryByTestId('regular-icon')).toBeNull();
    expect(component.getByTestId('filled-icon').props.testID).toBe('filled-icon');
  });

  it('renders a dual-token focus outline', async () => {
    const component = await renderTab({ controls: 'files-panel', content: 'Files' });
    const root = getRoot(component);
    await fireEvent(root, 'focus', {});

    expect(getRootStyle(component)).toMatchObject({
      borderColor: useFlexTokens().color.strokeFocusInner,
      outlineColor: useFlexTokens().color.strokeFocusOuter,
      outlineOffset: useFlexTokens().strokeWidth.thin,
      outlineStyle: 'solid',
      outlineWidth: useFlexTokens().strokeWidth.thick,
    });
  });

  it('applies user styles last', async () => {
    const component = await renderTab({ controls: 'files-panel', content: 'Files', style: { backgroundColor: 'hotpink' } });
    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
  });
});
