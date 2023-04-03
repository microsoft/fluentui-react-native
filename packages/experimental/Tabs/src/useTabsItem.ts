import * as React from 'react';

import type { IFocusable } from '@fluentui-react-native/interactive-hooks';
import { usePressableState, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

import { TabsContext } from './Tabs';
import type { TabsItemProps, TabsItemInfo } from './TabsItem.types';

/**
 * Re-usable hook for TabsItem.
 * This hook configures tabs item props and state for TabsItem.
 *
 * @param props user props sent to TabsItem
 * @returns configured props and state for TabsItem
 */
export const useTabsItem = (props: TabsItemProps): TabsItemInfo => {
  const defaultComponentRef = React.useRef<IFocusable>(null);
  const {
    accessibilityLabel,
    accessible,
    headerText,
    componentRef = defaultComponentRef,
    itemKey,
    disabled,
    itemCount,
    icon,
    ...rest
  } = props;
  // Grabs the context information from Tabs (currently selected TabsItem and client's onTabsClick callback).
  const info = React.useContext(TabsContext);

  const changeSelection = React.useCallback(() => {
    if (itemKey != info.selectedKey) {
      info.onTabsClick && info.onTabsClick(itemKey);
      info.getTabId && info.getTabId(itemKey, info.tabsItemKeys.findIndex((x) => x == itemKey) + 1);
      info.updateSelectedTabsItemRef && componentRef && info.updateSelectedTabsItemRef(componentRef);
    }
  }, [componentRef, info, itemKey]);

  const changeSelectionWithFocus = useOnPressWithFocus(componentRef, changeSelection);

  const pressable = usePressableState({
    ...rest,
    onPress: changeSelectionWithFocus,
    onFocus: changeSelection,
  });

  const onKeyUpProps = useKeyProps(changeSelection, ' ', 'Enter');

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

  /* We use the componentRef of the currently selected tabsItem to maintain the default tabbable
  element in Tabs. Since the componentRef isn't generated until after initial render,
  we must update it once here. */
  React.useEffect(() => {
    if (itemKey == info.selectedKey) {
      info.updateSelectedTabsItemRef && componentRef && info.updateSelectedTabsItemRef(componentRef);
    }
  }, [componentRef, info, itemKey]);

  return {
    props: {
      ...pressable.props,
      accessible: accessible ?? true,
      accessibilityRole: 'tab',
      accessibilityLabel: accessibilityLabel || headerText,
      focusable: !disabled ?? true,
      headerText: headerText ?? '',
      accessibilityState: { disabled: disabled, selected: info.selectedKey === itemKey },
      accessibilityActions: [{ name: 'Select' }],
      onAccessibilityAction: onAccessibilityAction,
      itemCount: itemCount,
      ref: useViewCommandFocus(componentRef),
      itemKey: itemKey,
      icon: icon,
      ...onKeyUpProps,
    },
    state: {
      ...pressable.state,
      selected: itemKey === info.selectedKey,
    },
  };
};
