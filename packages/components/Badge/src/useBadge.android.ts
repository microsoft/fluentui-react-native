import * as React from 'react';
import type { AccessibilityState } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import { usePressableState, useAsToggleWithEvent } from '@fluentui-react-native/interactive-hooks';

import DismissSvg from './assets/DismissIcon';
import type { BadgeInfo, BadgeProps } from './Badge.types';

export const useBadge = (props: BadgeProps): BadgeInfo => {
  const {
    accessibilityActions,
    accessibilityState,
    defaultSelected,
    selected,
    onSelectionChange,
    onAccessibilityAction,
    iconPosition = 'before',
    size = 'medium',
    icon,
    showCloseIcon,
    ...rest
  } = props;

  // Warns defaultChecked and checked being mutually exclusive.
  if (defaultSelected != undefined && selected != undefined) {
    console.warn('defaultSelected and selected are mutually exclusive to one another. Use one or the other.');
  }

  const [checkedValue, toggle] = useAsToggleWithEvent(defaultSelected, selected, onSelectionChange);
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
      accessibilityState: getAccessibilityState(checkedValue, accessibilityState),
      onAccessibilityAction: onAccessibilityActionProp,
      ...pressable.props,
      ...props,
      size: size != 'small' && size != 'medium' ? 'medium' : size,
      icon: showCloseIcon ? (!checkedValue ? icon : { svgSource: { src: DismissSvg } }) : icon,
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
