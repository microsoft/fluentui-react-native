/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';
import { Pressable, View } from 'react-native';

import { filterViewProps } from '@fluentui-react-native/adapters';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';
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
});

export const Tabs = compose<TabsType>({
  displayName: tabsName,

  usePrepareProps: (userProps: TabsProps, useStyling: IUseComposeStyling<TabsType>) => {
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

    /* The useSelectedKey hook is called after a TabsItem is pressed to update the Tab and TabsItem
    selected property and call the Tab and TabsItem onTabsClick callback. */
    const data = useSelectedKey(selectedKey || defaultSelectedKey || null, userProps.onTabsClick);

    const [selectedTabsItemRef, setSelectedTabsItemRef] = React.useState(React.useRef<View>(null));

    const onSelectTabsItemRef = React.useCallback(
      (ref: React.RefObject<View>) => {
        setSelectedTabsItemRef(ref);
      },
      [setSelectedTabsItemRef],
    );

    const findTabId = React.useCallback(
      (key: string, index: number) => {
        if (getTabId) {
          return getTabId(key, index);
        }
        return `${key}-Tab${index}`;
      },
      [getTabId],
    );

    // Stores views to be displayed.
    const map = new Map<string, React.ReactNode[]>();

    const state: TabsState = {
      context: {
        selectedKey: selectedKey ?? data.selectedKey,
        onTabsClick: data.onKeySelect,
        getTabId: findTabId,
        updateSelectedTabsItemRef: onSelectTabsItemRef,
        views: map,
      },
      info: {
        headersOnly: headersOnly ?? false,
        label: !!label,
      },
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const slotProps = mergeSettings<TabsSlotProps>(styleProps, {
      root: { ref: componentRef, accessibilityLabel: accessibilityLabel, accessibilityRole: 'tablist', ...rest },
      label: { children: label },
      container: { isCircularNavigation: isCircularNavigation, defaultTabbableElement: selectedTabsItemRef },
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<TabsSlotProps>, renderData: TabsRenderData, ...children: React.ReactNode[]) => {
    if (!renderData.state) {
      return null;
    }

    // Populate the tabsItemKeys array.
    if (children) {
      const enabledKeys = [];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - TODO, fix typing error
      // Generates array of keys and enabled keys.
      renderData.state.context.tabsItemKeys = React.Children.map(children, (child: React.ReactChild) => {
        if (React.isValidElement(child)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - TODO, fix typing error
          if (!child.props.disabled) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - TODO, fix typing error
            enabledKeys.push(child.props.itemKey);
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - TODO, fix typing error
          return child.props.itemKey;
        }
      });

      /* Sets the default selected TabsItem if a TabsItem is hidden.
      The default selected Tabsitem is the first enabled TabsItem. */
      if (!enabledKeys.includes(renderData.state.context.selectedKey)) {
        renderData.state.context.selectedKey = enabledKeys[0] ?? null;
      }
    }

    return (
      <TabsContext.Provider
        // Passes in the selected key and a hook function to update the newly selected tabsItem and call the client's onTabsClick callback.
        value={renderData.state?.context}
      >
        <Slots.root>
          {renderData.state?.info?.label && <Slots.label />}
          <Slots.container>
            <Slots.stack>{children}</Slots.stack>
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
    root: Pressable,
    label: Text,
    container: FocusZone,
    stack: { slotType: View, filter: filterViewProps },
    tabPanel: { slotType: View, filter: filterViewProps },
  },
  styles: {
    root: [],
    label: [foregroundColorTokens, textTokens],
    stack: [backgroundColorTokens],
  },
});

export default Tabs;
