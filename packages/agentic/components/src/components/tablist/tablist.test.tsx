/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import * as React from 'react';
import type { Pressable, ViewStyle } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Tab } from '../tab/tab';
import { TabList } from './tablist';
import { TabListContext } from './TabListContext';
import type { TabListContextValue } from './TabListContext';

function renderTabList(props: Partial<React.ComponentProps<typeof TabList>> = {}): Promise<RenderResult> {
  return render(
    <TabList accessibilityLabel="Sections" {...props}>
      <Tab controls="overview-panel" content="Overview" value="overview" />
      <Tab controls="disabled-panel" content="Disabled" disabled value="disabled" />
      <Tab controls="activity-panel" content="Activity" value="activity" />
    </TabList>,
  );
}

function getTabs(component: RenderResult) {
  return component.getAllByRole('tab');
}

function getRoot(component: RenderResult) {
  return component.getByRole('tablist');
}

function selected(tab: ReturnType<typeof getTabs>[number]) {
  return tab.props.accessibilityState.selected;
}

describe('TabList', () => {
  it('defaults to the first enabled Tab and exposes the list semantics', async () => {
    const component = await renderTabList();
    const root = getRoot(component);
    const tabs = getTabs(component);

    expect(root.props.accessibilityLabel).toBe('Sections');
    expect(root.props.accessible).toBe(true);
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ disabled: false });
    expect(tabs.map(selected)).toEqual([true, false, false]);
    expect(tabs.map((tab) => tab.props.focusable)).toEqual([true, false, false]);
    expect(tabs.map((tab) => tab.props.accessibilityPosInSet)).toEqual([1, 2, 3]);
    expect(tabs.map((tab) => tab.props.accessibilitySetSize)).toEqual([3, 3, 3]);
  });

  it('updates uncontrolled selection and preserves the Tab press handler', async () => {
    const onSelectionChange = jest.fn();
    const onPress = jest.fn();
    const component = await render(
      <TabList defaultSelectedValue="overview" onSelectionChange={onSelectionChange}>
        <Tab controls="overview-panel" content="Overview" value="overview" />
        <Tab controls="activity-panel" content="Activity" onPress={onPress} value="activity" />
      </TabList>,
    );

    await fireEvent.press(component.getByText('Activity'));

    const tabs = getTabs(component);
    expect(tabs.map(selected)).toEqual([false, true]);
    expect(tabs.map((tab) => tab.props.focusable)).toEqual([false, true]);
    expect(onSelectionChange).toHaveBeenCalledWith('activity');
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('reports controlled selection requests without mutating the selected value', async () => {
    const onSelectionChange = jest.fn();
    const component = await renderTabList({ onSelectionChange, selectedValue: 'overview' });

    await fireEvent.press(component.getByText('Activity'));

    expect(getTabs(component).map(selected)).toEqual([true, false, false]);
    expect(getTabs(component).map((tab) => tab.props.focusable)).toEqual([false, false, true]);
    expect(onSelectionChange).toHaveBeenCalledWith('activity');
  });

  it('moves automatic selection on the orientation axis and skips disabled Tabs', async () => {
    const onSelectionChange = jest.fn();
    const component = await renderTabList({ onSelectionChange });
    const preventDefault = jest.fn();

    await fireEvent(getTabs(component)[0], 'keyDown', {
      nativeEvent: { key: 'ArrowRight' },
      preventDefault,
    });

    expect(getTabs(component).map(selected)).toEqual([false, false, true]);
    expect(getTabs(component).map((tab) => tab.props.focusable)).toEqual([false, false, true]);
    expect(onSelectionChange).toHaveBeenCalledWith('activity');
    expect(preventDefault).toHaveBeenCalledTimes(1);

    await fireEvent(getTabs(component)[2], 'keyDown', {
      nativeEvent: { key: 'ArrowRight' },
      preventDefault,
    });
    expect(getTabs(component).map(selected)).toEqual([true, false, false]);
  });

  it('keeps selection independent from roving focus in manual activation mode', async () => {
    const component = await renderTabList({ selectionFollowsFocus: false });

    await fireEvent(getTabs(component)[0], 'keyDown', {
      nativeEvent: { key: 'ArrowRight' },
      preventDefault: jest.fn(),
    });

    expect(getTabs(component).map(selected)).toEqual([true, false, false]);
    expect(getTabs(component).map((tab) => tab.props.focusable)).toEqual([false, false, true]);

    await component.rerender(
      <TabList accessibilityLabel="Sections" selectionFollowsFocus={false}>
        <Tab controls="overview-panel" content="Overview" value="overview" />
        <Tab controls="disabled-panel" content="Disabled" disabled value="disabled" />
        <Tab controls="activity-panel" content="Activity" value="activity" />
      </TabList>,
    );
    expect(getTabs(component).map(selected)).toEqual([true, false, false]);
    expect(getTabs(component).map((tab) => tab.props.focusable)).toEqual([false, false, true]);

    await fireEvent.press(component.getByText('Activity'));
    expect(getTabs(component).map(selected)).toEqual([false, false, true]);
  });

  it('uses vertical arrows and supports Home and End without wrapping when disabled', async () => {
    const component = await renderTabList({
      circularNavigation: false,
      defaultSelectedValue: 'activity',
      orientation: 'vertical',
    });

    await fireEvent(getTabs(component)[2], 'keyDown', {
      nativeEvent: { key: 'ArrowDown' },
      preventDefault: jest.fn(),
    });
    expect(getTabs(component).map(selected)).toEqual([false, false, true]);

    await fireEvent(getTabs(component)[2], 'keyDown', {
      nativeEvent: { key: 'Home' },
      preventDefault: jest.fn(),
    });
    expect(getTabs(component).map(selected)).toEqual([true, false, false]);

    await fireEvent(getTabs(component)[0], 'keyDown', {
      nativeEvent: { key: 'End' },
      preventDefault: jest.fn(),
    });
    expect(getTabs(component).map(selected)).toEqual([false, false, true]);
  });

  it('removes every Tab from keyboard interaction when the list is disabled', async () => {
    const component = await renderTabList({ disabled: true });
    const tabs = getTabs(component);

    expect(tabs.map((tab) => tab.props.focusable)).toEqual([false, false, false]);
    expect(tabs.every((tab) => tab.props.accessibilityState.disabled)).toBe(true);
    expect(getRoot(component).props.accessibilityState).toEqual({ disabled: true });
  });

  it('uses controls as the value fallback', async () => {
    const component = await render(
      <TabList defaultSelectedValue="activity-panel">
        <Tab controls="overview-panel" content="Overview" />
        <Tab controls="activity-panel" content="Activity" />
      </TabList>,
    );

    expect(getTabs(component).map(selected)).toEqual([false, true]);
  });

  it('coordinates Tabs nested in a Fragment', async () => {
    const component = await render(
      <TabList defaultSelectedValue="activity">
        <>
          <Tab controls="overview-panel" content="Overview" value="overview" />
          <Tab controls="activity-panel" content="Activity" value="activity" />
        </>
      </TabList>,
    );

    expect(getTabs(component).map(selected)).toEqual([false, true]);
    expect(getTabs(component).map((tab) => tab.props.focusable)).toEqual([false, true]);
  });

  it('warns about duplicate Tab values in development', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await render(
      <TabList>
        <Tab controls="overview-panel" content="Overview" value="duplicate" />
        <Tab controls="activity-panel" content="Activity" value="duplicate" />
      </TabList>,
    );

    expect(consoleError).toHaveBeenCalledWith('TabList values must be unique. Duplicate value: "duplicate".');
    consoleError.mockRestore();
  });

  it('applies orientation, token gap, and user styles in order', async () => {
    const component = await renderTabList({ orientation: 'vertical', style: { gap: 99 } });
    const rootStyle = StyleSheet.flatten(getRoot(component).props.style) as ViewStyle;

    expect(rootStyle).toMatchObject({
      alignItems: 'flex-start',
      alignSelf: 'flex-start',
      flexDirection: 'column',
      gap: 99,
    });

    await component.rerender(
      <TabList accessibilityLabel="Sections">
        <Tab controls="overview-panel" content="Overview" />
      </TabList>,
    );
    expect(StyleSheet.flatten(getRoot(component).props.style)).toMatchObject({
      flexDirection: 'row',
      gap: defaultFlexTokens.spacing.componentBase100,
    });
  });

  it('requests focus after native eligibility and selection commit, then waits for confirmation', async () => {
    const ref = React.createRef<React.ComponentRef<typeof Pressable>>();
    const contexts: TabListContextValue[] = [];
    function Probe() {
      const value = React.useContext(TabListContext);
      if (value) {
        contexts.push(value);
      }
      return null;
    }
    const component = await render(
      <TabList>
        <Tab controls="one" content="One" />
        <Tab controls="two" content="Two" ref={ref} />
        <Probe />
      </TabList>,
    );
    const focus = jest.spyOn(ref.current!, 'focus').mockImplementation(() => {
      expect(getTabs(component)[1].props.focusable).toBe(true);
      expect(getTabs(component)[1].props.accessibilityState.selected).toBe(true);
    });
    focus.mockClear();
    await fireEvent(getTabs(component)[0], 'focus', {});
    await fireEvent(getTabs(component)[0], 'keyDown', { nativeEvent: { key: 'ArrowRight' }, preventDefault: jest.fn() });
    expect(focus).toHaveBeenCalledTimes(1);
    expect(contexts[contexts.length - 1].focusedValue).not.toBe('two');
    await fireEvent(getTabs(component)[1], 'focus', {});
    expect(contexts[contexts.length - 1].focusedValue).toBe('two');
    focus.mockRestore();
  });

  it('handles the native Select accessibility action and ignores modified navigation keys', async () => {
    const onAccessibilityAction = jest.fn();
    const component = await render(
      <TabList>
        <Tab controls="one" content="One" />
        <Tab controls="two" content="Two" onAccessibilityAction={onAccessibilityAction} />
      </TabList>,
    );
    await fireEvent(getTabs(component)[0], 'keyDown', { nativeEvent: { key: 'ArrowRight', ctrlKey: true } });
    expect(getTabs(component).map(selected)).toEqual([true, false]);
    await fireEvent(getTabs(component)[1], 'accessibilityAction', { nativeEvent: { actionName: 'Select' } });
    expect(getTabs(component).map(selected)).toEqual([false, true]);
    expect(onAccessibilityAction).toHaveBeenCalledTimes(1);
  });
});
