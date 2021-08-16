import * as React from 'react';
import { useAsPressable, useKeyCallback, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { TabsItemProps, TabsItemState } from './TabsItem.types';

const onSelect = () => {
  console.log('selected');
};

export const useTabsItem = (props: TabsItemProps): TabsItemState => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { componentRef = defaultComponentRef, ...rest } = props;
  const onClickWithFocus = useOnPressWithFocus(componentRef, onSelect);

  const pressable = useAsPressable({ ...rest, onPress: onClickWithFocus });
  const onKeyUp = useKeyCallback(onSelect, ' ', 'Enter');

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
