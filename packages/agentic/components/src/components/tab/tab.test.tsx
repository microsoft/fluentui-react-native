/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import type { Pressable, ViewStyle } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';
import type { FocusTarget } from '@fluentui-react-native/framework-base';

import { Tab } from './tab';
import { TabList } from '../tablist/tablist';
import { TabListContext } from '../tablist/TabListContext';
import type { TabListContextValue } from '../tablist/TabListContext';

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
  it('keeps its internal focus ref when the consumer omits ref', async () => {
    let registeredRef: FocusTarget | undefined;
    const contextValue: TabListContextValue = {
      activeValue: 'files',
      focusedValue: undefined,
      disabled: false,
      getPosition: () => 1,
      isTabDisabled: () => false,
      onTabFocus: jest.fn(),
      onTabBlur: jest.fn(),
      onTabKeyDown: jest.fn(),
      onTabPress: jest.fn(),
      orientation: 'horizontal',
      registerTab: (_value, ref) => {
        registeredRef = ref;
        return () => undefined;
      },
      selectedValue: 'files',
      setSize: 1,
    };

    await render(
      <TabListContext.Provider value={contextValue}>
        <Tab controls="files-panel" content="Files" value="files" />
      </TabListContext.Provider>,
    );

    expect(registeredRef?.current).not.toBeNull();
  });

  it('composes its ref prop with the internal TabList focus ref', async () => {
    const ref = React.createRef<React.ElementRef<typeof Pressable>>();

    await render(
      <TabList>
        <Tab controls="files-panel" content="Files" ref={ref} />
      </TabList>,
    );

    expect(ref.current).not.toBeNull();
  });

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

  describe.each([
    ['windows', 'select'],
    ['win32', 'Select'],
    ['macos', 'Select'],
  ] as const)('%s accessibility actions', (platform, actionName) => {
    beforeEach(() => {
      jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    });
    afterEach(() => jest.restoreAllMocks());

    it('selects through TabList once, preserves labels, and forwards the event without a press', async () => {
      const calls: string[] = [];
      const onSelectionChange = jest.fn(() => calls.push('selection'));
      const onAccessibilityAction = jest.fn(() => calls.push('action'));
      const onPress = jest.fn();
      const component = await render(
        <TabList defaultSelectedValue="overview" onSelectionChange={onSelectionChange}>
          <Tab controls="overview-panel" content="Overview" value="overview" />
          <Tab
            controls="files-panel"
            content="Files"
            value="files"
            accessibilityActions={[{ name: 'Select' }, { name: 'select', label: 'Show panel' }, { name: 'custom', label: 'More' }]}
            onAccessibilityAction={onAccessibilityAction}
            onPress={onPress}
          />
        </TabList>,
      );
      const root = component.getAllByRole('tab')[1];
      const event = { nativeEvent: { actionName } };
      expect(root.props.accessibilityActions).toEqual([
        { name: actionName, label: 'Show panel' },
        { name: 'custom', label: 'More' },
      ]);

      await fireEvent(root, 'accessibilityAction', event);

      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith('files');
      expect(component.getAllByRole('tab')[1].props.accessibilityState.selected).toBe(true);
      expect(onAccessibilityAction).toHaveBeenCalledTimes(1);
      expect(onAccessibilityAction).toHaveBeenCalledWith(event);
      expect(calls).toEqual(['selection', 'action']);
      expect(onPress).not.toHaveBeenCalled();
    });

    it('keeps standalone selection externally driven and forwards the action once', async () => {
      const onPress = jest.fn();
      const onAccessibilityAction = jest.fn();
      const component = await renderTab({ controls: 'files-panel', selected: false, onPress, onAccessibilityAction });
      const event = { nativeEvent: { actionName } };
      expect(getRoot(component).props.accessibilityActions).toEqual([{ name: actionName }]);

      await fireEvent(getRoot(component), 'accessibilityAction', event);

      expect(getRoot(component).props.accessibilityState.selected).toBe(false);
      expect(onAccessibilityAction).toHaveBeenCalledTimes(1);
      expect(onAccessibilityAction).toHaveBeenCalledWith(event);
      expect(onPress).not.toHaveBeenCalled();
    });

    it.each(['tab', 'list'] as const)('guards a disabled %s while forwarding the action once', async (disabledOwner) => {
      const onSelectionChange = jest.fn();
      const onAccessibilityAction = jest.fn();
      const onPress = jest.fn();
      const component = await render(
        <TabList disabled={disabledOwner === 'list'} selectedValue="overview" onSelectionChange={onSelectionChange}>
          <Tab controls="overview-panel" content="Overview" value="overview" />
          <Tab
            controls="files-panel"
            content="Files"
            value="files"
            disabled={disabledOwner === 'tab'}
            onAccessibilityAction={onAccessibilityAction}
            onPress={onPress}
          />
        </TabList>,
      );
      const root = component.getAllByRole('tab')[1];
      const event = { nativeEvent: { actionName } };
      root.props.onAccessibilityAction(event);
      expect(root.props.accessibilityState).toMatchObject({ disabled: true, selected: false });
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(onPress).not.toHaveBeenCalled();
      expect(onAccessibilityAction).toHaveBeenCalledTimes(1);
      expect(onAccessibilityAction).toHaveBeenCalledWith(event);
    });

    it('forwards custom, wrong-case, and activate actions without selecting', async () => {
      const onSelectionChange = jest.fn();
      const onAccessibilityAction = jest.fn();
      const onPress = jest.fn();
      const component = await render(
        <TabList defaultSelectedValue="overview" onSelectionChange={onSelectionChange}>
          <Tab controls="overview-panel" content="Overview" value="overview" />
          <Tab
            controls="files-panel"
            content="Files"
            value="files"
            onAccessibilityAction={onAccessibilityAction}
            onPress={onPress}
            accessibilityActions={[{ name: 'custom', label: 'More' }]}
          />
        </TabList>,
      );
      const root = component.getAllByRole('tab')[1];
      for (const name of ['custom', actionName === 'select' ? 'Select' : 'select', 'activate']) {
        const event = { nativeEvent: { actionName: name } };
        await fireEvent(root, 'accessibilityAction', event);
        expect(onAccessibilityAction).toHaveBeenLastCalledWith(event);
      }
      expect(onAccessibilityAction).toHaveBeenCalledTimes(3);
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(onPress).not.toHaveBeenCalled();
      expect(root.props.accessibilityState.selected).toBe(false);
    });
  });

  it('renders default icon-and-text accessibility and stable label overlay', async () => {
    const component = await renderTab({ controls: 'files-panel', content: 'Files' });
    const root = getRoot(component);
    const labels = component.getAllByText('Files', { includeHiddenElements: true });
    const tokens = defaultFlexTokens;

    expect(root.props.accessibilityRole).toBe('tab');
    expect(root.props.accessibilityControls).toBe('files-panel');
    expect(root.props.accessibilityState).toEqual({ disabled: false, selected: false });
    expect(root.props.focusable).toBe(true);
    expect(labels).toHaveLength(2);
    expect(StyleSheet.flatten(labels[0].props.style)).toMatchObject({ fontWeight: tokens.fontWeight.functionalSemibold, opacity: 0 });
    expect(StyleSheet.flatten(labels[1].props.style)).toMatchObject({
      fontWeight: tokens.fontWeight.functionalRegular,
    });
    expect(StyleSheet.flatten(labels[1].parent?.props.style)).toMatchObject({ position: 'absolute', justifyContent: 'center' });
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
    const colors = defaultFlexTokens.color;

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
    const tokens = defaultFlexTokens;

    expect(labels).toHaveLength(2);
    expect(StyleSheet.flatten(labels[0].props.style)).toMatchObject({
      fontWeight: tokens.fontWeight.functionalSemibold,
      opacity: 0,
    });
    expect(StyleSheet.flatten(labels[1].props.style)).toMatchObject({
      fontWeight: tokens.fontWeight.functionalSemibold,
    });
    expect(StyleSheet.flatten(labels[1].parent?.props.style)).toMatchObject({ position: 'absolute', justifyContent: 'center' });
  });

  it('exposes selected and disabled accessibility state', async () => {
    const component = await renderTab({ controls: 'archive-panel', content: 'Archive', disabled: true, selected: true });
    const root = getRoot(component);

    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ disabled: true, selected: true });
    expect(getRootStyle(component).backgroundColor).toBe(defaultFlexTokens.color.backgroundNeutralHeavyDisabled);
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
      borderRadius: defaultFlexTokens.borderRadius.circular,
      paddingHorizontal: defaultFlexTokens.spacing.componentBase150,
      paddingVertical: defaultFlexTokens.spacing.componentBase150,
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

  it('uses native focus visuals without mounting custom rings', async () => {
    const component = await renderTab({ controls: 'files-panel', content: 'Files' });
    const root = getRoot(component);
    await fireEvent(root, 'focus', {});
    expect(root.props.enableFocusRing).toBe(true);

    expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
  });

  it('applies user styles last', async () => {
    const component = await renderTab({ controls: 'files-panel', content: 'Files', style: { backgroundColor: 'hotpink' } });
    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
  });
});
