import * as React from 'react';
import { useAsPressable, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { TabsItemProps, TabsItemInfo } from './TabsItem.types';
import { TabsContext } from './Tabs';

/**
 * Re-usable hook for TabsItem.
 * This hook configures tabs item props and state for TabsItem.
 *
 * @param props user props sent to TabsItem
 * @returns configured props and state for TabsItem
 */
export const useTabsItem = (props: TabsItemProps): TabsItemInfo => {
  const defaultComponentRef = React.useRef(null);
  const { accessibilityLabel, headerText, componentRef = defaultComponentRef, itemKey, disabled, itemCount, icon, ...rest } = props;
  // Grabs the context information from Tabs (currently selected TabsItem and client's onTabsClick callback).
  const info = React.useContext(TabsContext);

  const changeSelection = () => {
    if (itemKey != info.selectedKey) {
      info.onTabsClick && info.onTabsClick(itemKey);
      info.getTabId && info.getTabId(itemKey, info.tabsItemKeys.findIndex((x) => x == itemKey) + 1);
      info.updateSelectedTabsItemRef && componentRef && info.updateSelectedTabsItemRef(componentRef);
    }
  };

  const changeSelectionWithFocus = useOnPressWithFocus(componentRef, changeSelection);

  const pressable = useAsPressable({
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
      ...pressable.props,
      accessible: true,
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
