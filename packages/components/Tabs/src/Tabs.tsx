/** @jsx withSlots */
import * as React from 'react';
import { Platform, View } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import { tabsName, TabsType, TabsProps, TabsState, TabsSlotProps, TabsRenderData, TabsContextData } from './Tabs.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { settings } from './Tabs.settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { foregroundColorTokens, textTokens, backgroundColorTokens } from '@fluentui-react-native/tokens';
import { useSelectedKey, useAsPressable } from '@fluentui-react-native/interactive-hooks';
import type { IKeyboardEvent } from '@office-iss/react-native-win32';

export const TabsContext = React.createContext<TabsContextData>({
  selectedKey: null,
  onTabsClick: (/* key: string */) => {
    return;
  },
  getTabId: (/* key:string, index: number*/) => {
    return null
  },
  updateSelectedTabsItemRef: (/* ref: React.RefObject<any>*/) => {
    return;
  },
  tabsItemKeys: [],
  enabledKeys: [],
  views: null,
  focusZoneRef: null,
});

export const Tabs = compose<TabsType>({
  displayName: tabsName,

  usePrepareProps: (userProps: TabsProps, useStyling: IUseComposeStyling<TabsType>) => {
    const focusZoneRef = React.useRef(null);
    const {
      label,
      accessibilityLabel = userProps.label,
      selectedKey,
      headersOnly,
      defaultSelectedKey,
      getTabId,
      componentRef = React.useRef(null),
      isCircularNavigation = false,
      ...rest
    } = userProps;

    // This hook updates the Selected TabsItem and calls the customer's onTabsClick function. This gets called after a TabsItem is pressed.
    const data = useSelectedKey(selectedKey || defaultSelectedKey || null, userProps.onTabsClick);

    const [selectedTabsItemRef, setSelectedTabsItemRef] = React.useState(React.useRef<View>(null));

    const onSelectTabsItemRef = React.useCallback(
      (ref: React.RefObject<View>) => {
        setSelectedTabsItemRef(ref);
      },
      [setSelectedTabsItemRef],
    );

    const onChangeTabId = React.useCallback((key: string, index: number) => {
      if (getTabId) {
        return getTabId(key, index);
      }
      return `${key}-Tab${index}`;
    }, []);

    // Stores views to be displayed
    const map = new Map<string, React.ReactNode[]>();

    const pressable = useAsPressable({
      ...rest,
    });

    const state: TabsState = {
      context: {
        selectedKey: selectedKey ?? data.selectedKey,
        onTabsClick: data.onKeySelect,
        getTabId: onChangeTabId,
        updateSelectedTabsItemRef: onSelectTabsItemRef,
        views: map,
        focusZoneRef: focusZoneRef,
      },
      info: {
        headersOnly: headersOnly ?? false,
        label: !!label && Platform.OS === 'windows',
      },
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const onKeyDown = (ev: IKeyboardEvent) => {
      if (ev.nativeEvent.key === 'ArrowRight' || ev.nativeEvent.key === 'ArrowLeft') {
        const length = state.context.enabledKeys.length;
        const currTabItemIndex = state.context.enabledKeys.findIndex(x => x == state.context.selectedKey)
        let newCurrTabItemIndex;
        if (ev.nativeEvent.key === 'ArrowRight') {
          if (!(!isCircularNavigation && currTabItemIndex + 1 == length)) {
            newCurrTabItemIndex = (currTabItemIndex + 1) % length;
            state.context.selectedKey = state.context.enabledKeys[newCurrTabItemIndex];
            data.onKeySelect(state.context.selectedKey);
          }
        }
        if (ev.nativeEvent.key === 'ArrowLeft') {
          if (!(!isCircularNavigation && currTabItemIndex == 0)) {
            newCurrTabItemIndex = (currTabItemIndex - 1 + length) % length;
            state.context.selectedKey = state.context.enabledKeys[newCurrTabItemIndex];
            data.onKeySelect(state.context.selectedKey);
          }
        }
      }
    };

    const slotProps = mergeSettings<TabsSlotProps>(styleProps, {
      root: { rest, ref: componentRef, accessibilityLabel: accessibilityLabel, accessibilityRole: Platform.OS !== 'windows' ? 'tablist' : null, ...pressable.props}, // Add windows role when RN is at >= 0.64
      label: { children: label },
      container: Platform.OS !== 'windows' ? { isCircularNavigation: isCircularNavigation, defaultTabbableElement: selectedTabsItemRef } : null,
      stack: Platform.OS !== 'windows' ? {style: {flexDirection:'row'}} : {style: {flexDirection:'row'}, focusable: true, ref: focusZoneRef, onKeyDown: onKeyDown}
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<TabsSlotProps>, renderData: TabsRenderData, ...children: React.ReactNode[]) => {
    if (renderData.state == undefined) {
      return null;
    }

    // Populate the tabsItemKeys array
    if (children) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - TODO, fix typing error
      renderData.state.context.tabsItemKeys = React.Children.map(children, (child: React.ReactChild) => {
        if (React.isValidElement(child)) {
          // Sets default selected tabItem
          if (renderData.state.context.selectedKey == null && !child.props.disabled) {
            renderData.state.context.selectedKey = child.props.itemKey;
          }
          return child.props.itemKey;
        }
      });
      if (Platform.OS === 'windows') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TODO, fix typing error
        renderData.state.context.enabledKeys = React.Children.map(children, (child: React.ReactChild) => {
          if (React.isValidElement(child)) {
            if (!child.props.disabled) {
              return child.props.itemKey;
            }
          }
        });
      }
    }

    return (
      <TabsContext.Provider
        // Passes in the selected key and a hook function to update the newly selected tabsItem and call the client's onTabsClick callback
        value={renderData.state.context}
      >
        <Slots.root>
          {renderData.state.info.label && <Slots.label />}
          <Slots.container>
            <Slots.stack>
              {children}
            </Slots.stack>
          </Slots.container>
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
    root: View,
    label: Text,
    container: Platform.OS !== 'windows' ? FocusZone : React.Fragment,
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
