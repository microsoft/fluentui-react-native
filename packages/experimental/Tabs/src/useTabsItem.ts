import * as React from 'react';
import { useAsPressable, useKeyCallback, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { TabsItemProps, TabsItemState } from './TabsItem.types';
import { TabsContext } from './Tabs';

export const useTabsItem = (props: TabsItemProps): TabsItemState => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { componentRef = defaultComponentRef, itemKey, ...rest } = props;
  const info = React.useContext(TabsContext);

  const changeSelection = () => {
    if (itemKey != info.selectedKey) {
      info.onTabsClick && info.onTabsClick(itemKey);
      info.getTabId && info.getTabId(itemKey, info.tabsItemKeys.findIndex(x => x == itemKey) + 1);
      info.updateSelectedTabsItemRef && componentRef && info.updateSelectedTabsItemRef(componentRef);
    }
    console.log('pressy');
  };

  const changeSelectionWithFocus = useOnPressWithFocus(componentRef, changeSelection);

  const pressable = useAsPressable({
    ...rest,
    onPress: changeSelectionWithFocus,
    onFocus: changeSelection,
  });

  const onKeyUp = useKeyCallback(changeSelection, ' ', 'Enter');

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
      onAccessibilityTap: props.onAccessibilityTap,
      accessibilityLabel: props.accessibilityLabel || props.headerText,
      focusable: true,
      ref: useViewCommandFocus(componentRef),
      onKeyUp: onKeyUp,
    },
    state: pressable.state,
  };
};
