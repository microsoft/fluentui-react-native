import * as React from 'react';
import type { View, AccessibilityState } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import { useSelectedKey } from '@fluentui-react-native/interactive-hooks';

import type { TabListProps, TabListInfo, TabListState } from './TabList.types';

/**
 * Re-usable hook for TabList.
 * This hook configures props and state for TabList.
 *
 * @param props user props sent to TabList
 * @returns configured props and state for TabList
 */
export const useTabList = (props: TabListProps): TabListInfo => {
  const defaultComponentRef = React.useRef(null);
  const {
    accessible,
    appearance = 'transparent',
    accessibilityState,
    componentRef = defaultComponentRef,
    defaultSelectedKey,
    disabled = false,
    isCircularNavigation,
    onTabSelect,
    selectedKey,
    size = 'medium',
    vertical = false,
  } = props;

  const data = useSelectedKey(selectedKey || defaultSelectedKey || null, onTabSelect);

  // selectedTabRef should be set to default tabbable element.
  const [selectedTabRef, setSelectedTabRef] = React.useState(React.useRef<View>(null));

  const onSelectTabRef = React.useCallback(
    (ref: React.RefObject<View>) => {
      setSelectedTabRef(ref);
    },
    [setSelectedTabRef],
  );

  const state: TabListState = {
    context: {
      appearance: appearance,
      disabled: disabled,
      onTabSelect: data.onKeySelect,
      selectedKey: selectedKey ?? data.selectedKey,
      size: size,
      updateSelectedTabRef: onSelectTabRef,
      vertical: vertical,
    },
  };

  return {
    props: {
      ...props,
      accessible: accessible ?? true,
      accessibilityState: getAccessibilityState(disabled, accessibilityState),
      accessibilityRole: 'tablist',
      appearance: appearance,
      componentRef: componentRef,
      defaultTabbableElement: selectedTabRef,
      isCircularNavigation: isCircularNavigation ?? false,
      size: size,
      vertical: vertical,
    },
    state: { ...state },
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, accessibilityState?: AccessibilityState): AccessibilityState {
  if (accessibilityState) {
    return { disabled, ...accessibilityState };
  }
  return { disabled };
}
