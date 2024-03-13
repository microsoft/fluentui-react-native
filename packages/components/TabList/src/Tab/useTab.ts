import * as React from 'react';
import type { AccessibilityActionEvent, AccessibilityState } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import type { IFocusable } from '@fluentui-react-native/interactive-hooks';
import { usePressableState, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

import type { TabProps, TabInfo } from './Tab.types';
import { TabListContext } from '../TabList/TabListContext';

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
  const { addTabKey, invoked, onTabSelect, removeTabKey, setInvoked, setFocusedTabRef, selectedKey, tabKeys, ...tablist } =
    React.useContext(TabListContext);

  const isDisabled = disabled || tablist.disabled;

  const changeSelection = React.useCallback(() => {
    if (tabKey !== selectedKey) {
      onTabSelect(tabKey);
      componentRef && setFocusedTabRef(componentRef);
    }
  }, [componentRef, setFocusedTabRef, onTabSelect, selectedKey, tabKey]);

  const changeSelectionWithFocus = useOnPressWithFocus(componentRef, changeSelection);

  const pressable = usePressableState({
    ...rest,
    onPress: changeSelectionWithFocus,
  });

  const onKeyProps = useKeyProps(changeSelection, ' ', 'Enter');

  /**
   * This runs on initial render. Here we do two things:
   * - We update the global TabList context to populate its list of all tabKeys.
   * - If a selected key is initially set, we update the initial defaultTabbableElement ref to be the selected element.
   *   This is because the componentRef is not generated until after the initial render.
   */
  React.useEffect(() => {
    // Add tab key to the global TabList context.
    addTabKey(tabKey);
    // Set a defaultTabbableElement if we're the initial selectedKey.
    if (selectedKey === tabKey) {
      componentRef && setFocusedTabRef(componentRef);
    }
    return () => removeTabKey(tabKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Used when creating accessibility properties in mergeSettings below.
  const onAccessibilityActionProp = React.useCallback(
    (event: AccessibilityActionEvent) => {
      if (!isDisabled) {
        switch (event.nativeEvent.actionName) {
          case 'Select':
            changeSelection();
            break;
        }
        onAccessibilityAction && onAccessibilityAction(event);
      }
    },
    [changeSelection, isDisabled, onAccessibilityAction],
  );

  const accessibilityActionsProp = React.useMemo(
    () => (accessibilityActions ? [...defaultAccessibilityActions, ...accessibilityActions] : defaultAccessibilityActions),
    [accessibilityActions],
  );

  return {
    props: {
      ...props,
      ...pressable.props,
      accessible: accessible ?? true,
      accessibilityRole: 'tab',
      accessibilityActions: accessibilityActionsProp,
      accessibilityPositionInSet: accessibilityPositionInSet ?? tabKeys.findIndex((key) => key === tabKey) + 1,
      accessibilityState: getAccessibilityState(isDisabled, selectedKey === tabKey, accessibilityState),
      accessibilitySetSize: accessibilitySetSize ?? tabKeys.length,
      disabled: isDisabled,
      focusable: !isDisabled ?? true,
      icon: icon,
      onAccessibilityAction: onAccessibilityActionProp,
      ref: useViewCommandFocus(componentRef),
      tabKey: tabKey,
      ...onKeyProps,
    },
    state: {
      ...pressable.state,
      selected: tabKey === selectedKey,
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
