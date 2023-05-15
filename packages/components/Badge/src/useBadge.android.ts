import * as React from 'react';
import type { AccessibilityState } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import { usePressableState, useAsToggleWithEvent } from '@fluentui-react-native/interactive-hooks';

import type { BadgeInfo, BadgeProps } from './Badge.types';

export const useBadge = (props: BadgeProps): BadgeInfo => {
  const {
    accessibilityActions,
    accessibilityState,
    defaultSelected,
    selected,
    onChange,
    onAccessibilityAction,
    iconPosition = 'before',
    size = 'medium',
    ...rest
  } = props;

  // Warns defaultChecked and checked being mutually exclusive.
  if (defaultSelected != undefined && selected != undefined) {
    console.warn('defaultSelected and selected are mutually exclusive to one another. Use one or the other.');
  }

  const [checkedValue, toggle] = useAsToggleWithEvent(defaultSelected, selected, onChange);
  const pressable = usePressableState({ onPress: toggle, ...rest });
  const onAccessibilityActionProp = React.useCallback(
    (event) => {
      switch (event.nativeEvent.actionName) {
        case 'Toggle':
          toggle(event);
          break;
      }
      onAccessibilityAction && onAccessibilityAction(event);
    },
    [toggle, onAccessibilityAction],
  );

  return {
    props: {
      iconPosition: iconPosition,
      size,
      accessibilityState: getAccessibilityState(checkedValue, accessibilityState),
      onAccessibilityAction: onAccessibilityActionProp,
      ...pressable.props,
      ...props,
    },
    state: {
      ...pressable.state,
      selected: checkedValue,
    },
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(checked: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { checked, ...accessibilityState };
  }
  return { checked };
}
