/** @jsx withSlots */
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { Text } from '@fluentui-react-native/text';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import { settings, tabsItemSelectActionLabel } from './TabsItem.settings';
import { backgroundColorTokens, borderTokens, textTokens, foregroundColorTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { TabsContext } from './Tabs';
import { tabsItemName, TabsItemType, TabsItemProps, TabsItemSlotProps, TabsItemRenderData, TabsItemState } from './TabsItem.types';
import { usePressableState, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

export const TabsItem = compose<TabsItemType>({
  displayName: tabsItemName,

  usePrepareProps: (userProps: TabsItemProps, useStyling: IUseComposeStyling<TabsItemType>) => {
    const defaultComponentRef = React.useRef(null);
    const {
      icon,
      headerText = '',
      accessibilityLabel = userProps.headerText,
      componentRef = defaultComponentRef,
      itemKey,
      itemCount,
      accessibilityPositionInSet,
      accessibilitySetSize,
      ...rest
    } = userProps;

    // Grabs the context information from Tabs (currently selected TabsItem and client's onTabsClick callback).
    const info = React.useContext(TabsContext);

    const changeSelection = React.useCallback(() => {
      info.focusZoneRef.current.focus(); // GH #964, FocusZone not implemented on windows.
      info.onTabsClick && info.onTabsClick(itemKey);
      info.getTabId && info.getTabId(itemKey, info.tabsItemKeys.findIndex((x) => x == itemKey) + 1);
      info.updateSelectedTabsItemRef && componentRef && info.updateSelectedTabsItemRef(componentRef);
    }, [componentRef, info, itemKey]);

    const pressable = usePressableState({
      ...rest,
      onPress: changeSelection,
    });

    // Set up state.
    const state: TabsItemState = {
      info: {
        ...pressable.state,
        selected: info.selectedKey === userProps.itemKey,
        icon: false, // GH #935, Icons are on backlog for windows.
        key: itemKey,
        headerText: !!headerText || itemCount !== undefined,
      },
    };

    const buttonRef = useViewCommandFocus(componentRef);

    /**
     * We use the componentRef of the currently selected tabsItem to maintain the default tabbable
     * element in Tabs. Since the componentRef isn't generated until after initial render,
     * we must update it once here.
     * Since this is meant to only be run once, surpressing lint error
     */
    React.useEffect(() => {
      if (itemKey == info.selectedKey) {
        info.updateSelectedTabsItemRef && componentRef && info.updateSelectedTabsItemRef(componentRef);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Grab the styling information from the userProps, referencing the state as well as the props.
    const styleProps = useStyling(userProps, (override: string) => state.info[override] || userProps[override]);

    // Used when creating accessibility properties in mergeSettings below.
    const onAccessibilityAction = React.useCallback(
      (event: { nativeEvent: { actionName: any } }) => {
        switch (event.nativeEvent.actionName) {
          case 'Select':
            changeSelection();
            break;
        }
      },
      [changeSelection],
    );

    const countText = itemCount !== undefined ? ` (${itemCount})` : '';

    const slotProps = mergeSettings<TabsItemSlotProps>(styleProps, {
      root: {
        ...rest,
        ...pressable.props,
        ref: buttonRef,
        accessibilityRole: 'tab',
        accessibilityLabel: accessibilityLabel,
        accessibilityState: { disabled: userProps.disabled, selected: info.selectedKey === userProps.itemKey },
        accessibilityActions: [{ name: 'Select', label: tabsItemSelectActionLabel }],
        accessibilityPositionInSet: accessibilityPositionInSet ?? info.tabsItemKeys.findIndex((x) => x == itemKey) + 1,
        accessibilitySetSize: accessibilitySetSize ?? info.tabsItemKeys.length,
        onAccessibilityAction: onAccessibilityAction,
        focusable: false,
      },
      content: { children: headerText + countText },
      icon: createIconProps(icon),
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<TabsItemSlotProps>, renderData: TabsItemRenderData, ...children: React.ReactNode[]) => {
    const info = renderData.state!.info;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const context = React.useContext(TabsContext);
    // Sets the view that belongs to a TabItem.
    context.views.set(info.key, children);

    return (
      <Slots.root>
        <Slots.stack>
          {info.icon && <Slots.icon />}
          {info.headerText && <Slots.content />}
        </Slots.stack>
        <Slots.indicator />
      </Slots.root>
    );
  },

  settings,
  slots: {
    root: Pressable,
    stack: { slotType: View, filter: filterViewProps },
    icon: { slotType: Icon as React.ComponentType },
    content: Text,
    indicator: { slotType: View, filter: filterViewProps },
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
    stack: [],
    icon: [{ source: 'iconColor', lookup: getPaletteFromTheme, target: 'color' }],
    content: [textTokens, foregroundColorTokens],
    indicator: [{ source: 'indicatorColor', lookup: getPaletteFromTheme, target: 'backgroundColor' }],
  },
});

export default TabsItem;
