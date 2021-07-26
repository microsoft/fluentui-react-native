/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import { tabsName, TabsType, TabsProps, TabsState, TabsSlotProps, TabsRenderData, ITabsContext } from './Tabs.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { settings } from './Tabs.settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { foregroundColorTokens, textTokens } from '@fluentui-react-native/tokens';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';

export const TabsContext = React.createContext<ITabsContext>({
  selectedKey: null,
  onTabsClick: (/* key: string */) => {
    return;
  },
  updateSelectedButtonRef: (/* ref: React.RefObject<any>*/) => {
    return;
  },
  buttonKeys: [],
});

export const Tabs = compose<TabsType>({
  displayName: tabsName,

  usePrepareProps: (userProps: TabsProps, useStyling: IUseComposeStyling<TabsType>) => {
    const { label, ariaLabel, selectedKey, defaultSelectedKey, ...rest } = userProps;

    // This hook updates the Selected Button and calls the customer's onClick function. This gets called after a button is pressed.
    const data = useSelectedKey(selectedKey || defaultSelectedKey || null, userProps.onTabsClick);

    const [selectedButtonRef, setSelectedButtonRef] = React.useState(React.useRef<View>(null));

    const onSelectButtonRef = React.useCallback(
      (ref: React.RefObject<View>) => {
        setSelectedButtonRef(ref);
      },
      [setSelectedButtonRef],
    );

    const state: TabsState = {
      context: {
        selectedKey: selectedKey ?? data.selectedKey,
        onTabsClick: data.onKeySelect,
        updateSelectedButtonRef: onSelectButtonRef,
      },
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const ariaRoles = {
      accessibilityRole: 'tablist',
      accessibilityLabel: ariaLabel || label,
    };

    const slotProps = mergeSettings<TabsSlotProps>(styleProps, {
      root: { rest, ...ariaRoles },
      label: { children: label },
      container: { isCircularNavigation: true, defaultTabbableElement: selectedButtonRef },
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<TabsSlotProps>, renderData: TabsRenderData, ...children: React.ReactNode[]) => {
    if (renderData.state == undefined) {
      return null;
    }

    // Populate the buttonKeys array
    if (children) {
      /* eslint-disable @typescript-eslint/ban-ts-ignore */
      // @ts-ignore - TODO, fix typing error
      renderData.state.context.buttonKeys = React.Children.map(children, (child: React.ReactChild) => {
        if (React.isValidElement(child)) {
          if (renderData.state.context.selectedKey == null) {
            renderData.state.context.selectedKey = child.props.buttonKey;
          }
          return child.props.buttonKey;
        }
      });
    }

    return (
      <TabsContext.Provider
        // Passes in the selected key and a hook function to update the newly selected button and call the client's onTabsClick callback
        value={renderData.state.context}
      >
        <Slots.root>
          <Slots.label />
          <Slots.container>{children}</Slots.container>
        </Slots.root>
      </TabsContext.Provider>
    );
  },

  settings,
  slots: {
    root: View,
    label: Text,
    container: FocusZone,
  },
  styles: {
    root: [],
    label: [foregroundColorTokens, textTokens],
    container: [],
  },
});

export default Tabs;
