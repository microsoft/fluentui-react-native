import * as React from 'react';

import { usePressableState, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

import { TabsContext } from './Tabs';
import type { TabsItemProps, TabsItemInfo, TabsItemState } from './TabsItem.types';

/**
 * Re-usable hook for TabsItem.
 * This hook configures tabs item props and state for TabsItem.
 *
 * @param props user props sent to TabsItem
 * @returns configured props and state for TabsItem
 */
export const useTabsItem = (props: TabsItemProps): TabsItemInfo => {
  const defaultComponentRef = React.useRef(null);
  const { accessibilityLabel, accessible, headerText, componentRef = defaultComponentRef, itemKey, disabled, itemCount, ...rest } = props;
  // Grabs the context information from Tabs (currently selected TabsItem and client's onTabsClick callback).
  const info = React.useContext(TabsContext);

  const changeSelection = React.useCallback(() => {
    info.focusZoneRef?.current?.focus(); // GH #964, FocusZone not implemented on windows.
    info.onTabsClick && info.onTabsClick(itemKey);
    info.getTabId && info.getTabId(itemKey, info.tabsItemKeys.findIndex((x) => x == itemKey) + 1);
    info.updateSelectedTabsItemRef && componentRef && info.updateSelectedTabsItemRef(componentRef);
  }, [componentRef, info, itemKey]);

  const pressable = usePressableState({
    ...rest,
    onPress: changeSelection,
  });

  const state: TabsItemState = {
    ...pressable.state,
    selected: info.selectedKey === itemKey,
  };

  // Used when creating accessibility properties in mergeSettings below.
  const onAccessibilityAction = React.useCallback(
    (event: { nativeEvent: { actionName: any } }) => {
      switch (event.nativeEvent.actionName) {
        case 'Select':
          changeSelection();
          break;
      }
    },
    [info, itemKey],
  );

  /* We use the componentRef of the currently selected tabsItem to maintain the default tabbable
  element in Tabs. Since the componentRef isn't generated until after initial render,
  we must update it once here. */
  React.useEffect(() => {
    if (itemKey == info.selectedKey) {
      info.updateSelectedTabsItemRef && componentRef && info.updateSelectedTabsItemRef(componentRef);
    }
  }, []);

  return {
    props: {
      ...rest,
      ...pressable.props,
      accessible: accessible ?? true,
      ref: useViewCommandFocus(componentRef),
      accessibilityRole: 'tab',
      accessibilityLabel: accessibilityLabel || headerText,
      focusable: false,
      headerText: headerText ?? '',
      accessibilityState: { disabled: disabled, selected: info.selectedKey === itemKey },
      accessibilityActions: [{ name: 'Select' }],
      onAccessibilityAction: onAccessibilityAction,
      itemCount: itemCount,
      itemKey: itemKey,
    },
    state: {
      ...state,
    },
  };
};
