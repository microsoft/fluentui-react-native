/** @jsx withSlots */
import * as React from 'react';
import { Pressable, View } from 'react-native';

import { filterViewProps } from '@fluentui-react-native/adapters';
import { useSelectedKey, usePressableState } from '@fluentui-react-native/interactive-hooks';
import { Text } from '@fluentui-react-native/text';
import { foregroundColorTokens, textTokens, backgroundColorTokens } from '@fluentui-react-native/tokens';
import type { ISlots } from '@uifabricshared/foundation-composable';
import { withSlots } from '@uifabricshared/foundation-composable';
import type { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import { settings } from './Tabs.settings';
import type { TabsType, TabsProps, TabsState, TabsSlotProps, TabsRenderData, TabsContextData } from './Tabs.types';
import { tabsName } from './Tabs.types';

export const TabsContext = React.createContext<TabsContextData>({
  selectedKey: null,
  onTabsClick: (/* key: string */) => {
    return;
  },
  getTabId: (/* key:string, index: number*/) => {
    return null;
  },
  updateSelectedTabsItemRef: (/* ref: React.RefObject<any>*/) => {
    return;
  },
  tabsItemKeys: [],
  views: null,
  focusZoneRef: null,
});

export const Tabs = compose<TabsType>({
  displayName: tabsName,

  usePrepareProps: (userProps: TabsProps, useStyling: IUseComposeStyling<TabsType>) => {
    const focusZoneRef = React.useRef(null);
    const defaultComponentRef = React.useRef(null);
    const {
      label,
      accessibilityLabel = userProps.label,
      selectedKey,
      headersOnly,
      defaultSelectedKey,
      getTabId,
      componentRef = defaultComponentRef,
      isCircularNavigation,
      ...rest
    } = userProps;

    // This hook updates the Selected TabsItem and calls the customer's onTabsClick function. This gets called after a TabsItem is pressed.
    const data = useSelectedKey(selectedKey || defaultSelectedKey || null, userProps.onTabsClick);

    const findTabId = React.useCallback(
      (key: string, index: number) => {
        if (getTabId) {
          return getTabId(key, index);
        }
        return `${key}-Tab${index}`;
      },
      [getTabId],
    );

    // Stores views to be displayed
    const map = new Map<string, React.ReactNode[]>();

    const state: TabsState = {
      context: {
        selectedKey: selectedKey ?? data.selectedKey,
        onTabsClick: data.onKeySelect,
        getTabId: findTabId,
        views: map,
        focusZoneRef: focusZoneRef,
      },
      info: {
        headersOnly: headersOnly ?? false,
        label: !!label,
      },
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const pressable = usePressableState({ ...rest });

    const onKeyDown = (ev: any) => {
      if (ev.nativeEvent.key === 'ArrowRight' || ev.nativeEvent.key === 'ArrowLeft') {
        const length = state.info.enabledKeys.length;
        const currTabItemIndex = state.info.enabledKeys.findIndex((x) => x == state.context.selectedKey);
        let newCurrTabItemIndex;
        if (ev.nativeEvent.key === 'ArrowRight') {
          if (isCircularNavigation || !(currTabItemIndex + 1 == length)) {
            newCurrTabItemIndex = (currTabItemIndex + 1) % length;
            state.context.selectedKey = state.info.enabledKeys[newCurrTabItemIndex];
            data.onKeySelect(state.context.selectedKey);
          }
        } else {
          if (isCircularNavigation || !(currTabItemIndex == 0)) {
            newCurrTabItemIndex = (currTabItemIndex - 1 + length) % length;
            state.context.selectedKey = state.info.enabledKeys[newCurrTabItemIndex];
            data.onKeySelect(state.context.selectedKey);
          }
        }
      }
    };

    /* GH #964, Extra props are needed because FocusZone is not implemented on windows.
    The ref focusZoneRef is used to set focus on Tabs when selecting a TabsItem and onKeyDown manages keyboarding */
    const slotProps = mergeSettings<TabsSlotProps>(styleProps, {
      root: { ref: componentRef, accessibilityLabel: accessibilityLabel, accessibilityRole: 'tablist', ...pressable.props, ...rest },
      label: { children: label },
      stack: { focusable: true, ref: focusZoneRef, onKeyDown: onKeyDown },
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<TabsSlotProps>, renderData: TabsRenderData, ...children: React.ReactNode[]) => {
    if (!renderData.state) {
      return null;
    }

    // Populate the tabsItemKeys array
    if (children) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - TODO, fix typing error
      renderData.state.context.tabsItemKeys = React.Children.map(children, (child: React.ReactChild) => {
        if (React.isValidElement(child)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - TODO, fix typing error
          return child.props.itemKey;
        }
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - TODO, fix typing error
      renderData.state.info.enabledKeys = React.Children.map(children, (child: React.ReactChild) => {
        if (React.isValidElement(child)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - TODO, fix typing error
          if (!child.props.disabled) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - TODO, fix typing error
            return child.props.itemKey;
          }
        }
      });

      /* Sets the default selected TabsItem if a TabsItem is hidden.
      The default selected Tabsitem is the first enabled TabsItem. */
      if (!renderData.state.info.enabledKeys.includes(renderData.state.context.selectedKey)) {
        renderData.state.context.selectedKey = renderData.state.info.enabledKeys[0] ?? null;
      }
    }

    return (
      <TabsContext.Provider
        // Passes in the selected key and a hook function to update the newly selected tabsItem and call the client's onTabsClick callback
        value={renderData.state?.context}
      >
        <Slots.root>
          {renderData.state?.info?.label && <Slots.label />}
          <Slots.stack>{children}</Slots.stack>
          <Slots.tabPanel>
            <TabsContext.Consumer>
              {(context) => !renderData.state.info.headersOnly && context.views.get(context.selectedKey)}
            </TabsContext.Consumer>
          </Slots.tabPanel>
        </Slots.root>
      </TabsContext.Provider>
    );
  },

  settings,
  slots: {
    root: Pressable,
    label: Text,
    stack: View,
    tabPanel: { slotType: View, filter: filterViewProps },
  },
  styles: {
    root: [],
    label: [foregroundColorTokens, textTokens],
    stack: [backgroundColorTokens],
  },
});

export default Tabs;
