import * as React from 'react';
import { Pressable } from 'react-native';

import {
  type PropsWithRefOf,
  useAccessibilityLabelWarning,
  usePressableState,
  useOptionalSlot,
  useSlot,
} from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import { resolveFocusable } from '../../common/interaction';
import type { TabProps, TabState } from './tab.types';
import { Icon } from '../../primitives/icon/icon';
import { TabListContext } from '../tablist/TabListContext';
import { Text } from '../text/text';

/**
 * Hook to create the state for a Tab component.
 */
export function useTab_unstable(props: TabProps): TabState {
  const tabList = React.useContext(TabListContext);
  const {
    accessibilityState,
    controls,
    content: contentProp,
    disabled = false,
    icon: iconProp,
    layout = 'iconAndText',
    ref: rootRef,
    selected = false,
    selectedIcon: selectedIconProp,
    style: userStyle,
    value: valueProp,
    ...rest
  } = props;
  const value = valueProp ?? controls;
  const iconOnly = layout === 'iconOnly';
  const tabRef = React.useRef<React.ElementRef<typeof Pressable>>(null);
  const listDisabled = tabList?.isTabDisabled(value, disabled) ?? disabled;
  const listSelected = tabList ? tabList.selectedValue === value : selected;
  const listFocusable = tabList ? tabList.activeValue === value && !listDisabled : resolveFocusable(rest.focusable, disabled);
  const { onFocus, onKeyDown, onPress, ...nativeRest } = rest;
  const registerTab = tabList?.registerTab;

  React.useEffect(() => registerTab?.(value, tabRef), [registerTab, value]);

  useAccessibilityLabelWarning({
    accessibilityLabel: rest.accessibilityLabel ?? rest['aria-label'],
    accessibilityLabelledBy: rest.accessibilityLabelledBy ?? rest['aria-labelledby'],
    componentName: 'Tab',
    requireLabel: iconOnly,
    warning: 'Tab: icon-only tabs require an accessibilityLabel that describes the content panel.',
  });

  const themeState = useThemeState();
  const [pressableProps, pressableState] = usePressableState({
    ...nativeRest,
    accessibilityPosInSet: tabList?.getPosition(value),
    accessibilitySetSize: tabList?.setSize,
    role: 'tab',
    accessibilityState: {
      ...accessibilityState,
      disabled: listDisabled,
      selected: listSelected,
    },
    accessible: nativeRest.accessible ?? true,
    disabled: listDisabled,
    focusable: listFocusable,
    onFocus: (event) => {
      tabList?.onTabFocus(value);
      onFocus?.(event);
    },
    onKeyDown: (event) => {
      tabList?.onTabKeyDown(value, event);
      onKeyDown?.(event);
    },
    onPress: (event) => {
      tabList?.onTabPress(value);
      onPress?.(event);
    },
  });

  const root = useSlot(Pressable, {
    ...pressableProps,
    accessibilityControls: controls,
    ref: rootRef,
  } as PropsWithRefOf<typeof Pressable> & { accessibilityControls: string });
  const icon = useOptionalSlot(Icon, iconProp);
  const selectedIcon = useOptionalSlot(Icon, selectedIconProp);
  const contentSlotProp = iconOnly ? null : (contentProp ?? 'Tab');
  const content = useOptionalSlot(Text, contentSlotProp);
  const contentHidden = useOptionalSlot(Text, contentSlotProp);

  return {
    root,
    icon,
    selectedIcon,
    content,
    contentHidden,
    disabled: listDisabled,
    layout,
    controls,
    selected: listSelected,
    tabRef,
    value,
    iconOnly,
    userStyle,
    ...themeState,
    ...pressableState,
  };
}
