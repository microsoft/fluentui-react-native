import * as React from 'react';
import type { AccessibilityState } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import { createIconProps } from '@fluentui-react-native/icon';
import { usePressableState, useAsToggleWithEvent } from '@fluentui-react-native/interactive-hooks';
import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

import DismissSvg from './assets/DismissIcon';
import type { ChipInfo, ChipProps } from './Chip.types';

export const useChip = (props: ChipProps): ChipInfo => {
  const {
    accessibilityActions,
    accessibilityState,
    defaultSelected,
    selected,
    onSelectionChange,
    onAccessibilityAction,
    size = 'medium',
    icon,
    showCloseIcon,
    closeIconOnPress,
    ...rest
  } = props;

  // Warns defaultChecked and checked being mutually exclusive.
  if (defaultSelected !== undefined && selected !== undefined) {
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

  const iconProps = createIconProps(showCloseIcon ? (!checkedValue ? icon : { svgSource: { src: DismissSvg } }) : icon);
  const closeIconVisibile = showCloseIcon && checkedValue;
  const iconPressFunction = React.useCallback(
    (e: InteractionEvent) => {
      if (closeIconVisibile && closeIconOnPress) {
        closeIconOnPress(e);
      }
    },
    [checkedValue, showCloseIcon, closeIconOnPress],
  );

  return {
    props: {
      accessibilityState: getAccessibilityState(checkedValue, accessibilityState),
      onAccessibilityAction: onAccessibilityActionProp,
      ...pressable.props,
      ...props,
      size,
      toggle,
      iconProps,
      iconPressFunction,
      closeIconVisibile,
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
