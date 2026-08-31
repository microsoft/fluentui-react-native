/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { useFlexTokens } from '@fluentui-react-native/design';

import { Tab } from './tab';
import { TabList } from '../tablist/tablist';

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
  it('renders selection without changing it on press', async () => {
    const onPress = jest.fn();
    const component = await renderTab({ controls: 'files-panel', content: 'Files', onPress, selected: false });

    await fireEvent.press(getRoot(component));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getRoot(component).props.accessibilityState.selected).toBe(false);
  });

  it('takes selection, disabled state, and set metadata from TabList context', async () => {
    const component = await render(
      <TabList defaultSelectedValue="activity">
        <Tab controls="overview-panel" content="Overview" value="overview" />
        <Tab controls="activity-panel" content="Activity" value="activity" />
      </TabList>,
    );
    const tabs = component.getAllByRole('tab');

    expect(tabs[0].props.accessibilityState).toEqual({ disabled: false, selected: false });
    expect(tabs[0].props.focusable).toBe(false);
    expect(tabs[0].props.accessibilityPosInSet).toBe(1);
    expect(tabs[1].props.accessibilityState).toEqual({ disabled: false, selected: true });
    expect(tabs[1].props.focusable).toBe(true);
    expect(tabs[1].props.accessibilitySetSize).toBe(2);
  });

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

  it('renders a persistent dual-ring focus visual', async () => {
    const component = await renderTab({ controls: 'files-panel', content: 'Files' });
    const root = getRoot(component);
    await fireEvent(root, 'focus', {});

    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: useFlexTokens().color.strokeFocusOuter,
      borderWidth: useFlexTokens().strokeWidth.thick,
    });
    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).not.toHaveProperty(
      'opacity',
    );
    expect(StyleSheet.flatten(component.getByTestId('focus-visual-inner', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: useFlexTokens().color.strokeFocusInner,
      borderWidth: useFlexTokens().strokeWidth.thin,
    });
  });

  it('applies user styles last', async () => {
    const component = await renderTab({ controls: 'files-panel', content: 'Files', style: { backgroundColor: 'hotpink' } });
    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
  });
});
