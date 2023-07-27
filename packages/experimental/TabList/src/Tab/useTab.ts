import * as React from 'react';
import type { AccessibilityActionEvent, AccessibilityState } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import type { IFocusable } from '@fluentui-react-native/interactive-hooks';
import { usePressableState, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

import type { TabProps, TabInfo } from './Tab.types';
import { TabListContext } from '../TabList/TabList';

const defaultAccessibilityActions = [{ name: 'Select' }];

/**
 * Re-usable hook for Tab.
 * This hook configures tabs item props and state for Tab.
 *
 * @param props user props sent to Tab
 * @returns configured props and state for Tab
 */
export const useTab = (props: TabProps): TabInfo => {
  const defaultComponentRef = React.useRef<IFocusable>(null);
  const {
    accessibilityActions,
    accessibilityPositionInSet,
    accessibilitySetSize,
    accessibilityState,
    accessible,
    componentRef = defaultComponentRef,
    disabled,
    icon,
    onAccessibilityAction,
    tabKey,
    ...rest
  } = props;
  // Grabs the context information from Tabs (currently selected Tab and client's onTabSelect callback).
  const info = React.useContext(TabListContext);

  const changeSelection = React.useCallback(() => {
    if (tabKey != info.selectedKey) {
      info.onTabSelect && info.onTabSelect(tabKey);
      info.updateSelectedTabRef && componentRef && info.updateSelectedTabRef(componentRef);
    }
  }, [componentRef, info, tabKey]);

  const changeSelectionWithFocus = useOnPressWithFocus(componentRef, changeSelection);

  const pressable = usePressableState({
    ...rest,
    onPress: changeSelectionWithFocus,
    onFocus: changeSelection,
  });

  const onKeyUpProps = useKeyProps(changeSelection, ' ', 'Enter');

  // Used when creating accessibility properties in mergeSettings below.
  const onAccessibilityActionProp = React.useCallback(
    (event: AccessibilityActionEvent) => {
      if (!disabled) {
        switch (event.nativeEvent.actionName) {
          case 'Select':
            changeSelection();
            break;
        }
        onAccessibilityAction && onAccessibilityAction(event);
      }
    },
    [changeSelection, disabled, onAccessibilityAction],
  );

  const accessibilityActionsProp = React.useMemo(
    () => (accessibilityActions ? [...defaultAccessibilityActions, ...accessibilityActions] : defaultAccessibilityActions),
    [accessibilityActions],
  );

  /* We use the componentRef of the currently selected tab to maintain the default tabbable
  element in Tabs. Since the componentRef isn't generated until after initial render,
  we must update it once here. */
  React.useEffect(() => {
    if (tabKey == info.selectedKey) {
      info.updateSelectedTabRef && componentRef && info.updateSelectedTabRef(componentRef);
    }
  }, [componentRef, info, tabKey]);

  return {
    props: {
      ...props,
      ...pressable.props,
      accessible: accessible ?? true,
      accessibilityRole: 'tab',
      accessibilityActions: accessibilityActionsProp,
      accessibilityPositionInSet: accessibilityPositionInSet ?? info.tabKeys.findIndex((key) => key === tabKey) + 1,
      accessibilityState: getAccessibilityState(disabled, info.selectedKey === tabKey, accessibilityState),
      accessibilitySetSize: accessibilitySetSize ?? info.tabKeys.length,
      disabled: info.disabled || props.disabled,
      focusable: !disabled ?? true,
      icon: icon,
      onAccessibilityAction: onAccessibilityActionProp,
      ref: useViewCommandFocus(componentRef),
      tabKey: tabKey,
      ...onKeyUpProps,
    },
    state: {
      ...pressable.state,
      selected: tabKey === info.selectedKey,
    },
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, selected: boolean, accessibilityState?: AccessibilityState): AccessibilityState {
  if (accessibilityState) {
    return { disabled, selected, ...accessibilityState };
  }
  return { disabled, selected };
}
