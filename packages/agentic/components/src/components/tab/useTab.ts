import * as React from 'react';
import { Platform, Pressable } from 'react-native';

import {
  type PropsWithRefOf,
  resolveAccessibilityAction,
  useAccessibilityLabelWarning,
  useFocusablePressable,
  isSelfTargetEvent,
  useOptionalSlot,
  useSlot,
} from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';
import { useFocusVisuals } from '../../common/useFocusVisuals';

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
    accessibilityActions,
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
  const listDisabled = tabList?.isTabDisabled(value, disabled) ?? disabled;
  const listSelected = tabList ? tabList.selectedValue === value : selected;
  const listFocusable = tabList ? tabList.activeValue === value && !listDisabled : (rest.focusable ?? !disabled);
  const { onFocus, onBlur, onKeyDown, onPress, onAccessibilityAction, ...nativeRest } = rest;
  const registerTab = tabList?.registerTab;

  useAccessibilityLabelWarning({
    accessibilityLabel: rest.accessibilityLabel ?? rest['aria-label'],
    accessibilityLabelledBy: rest.accessibilityLabelledBy ?? rest['aria-labelledby'],
    componentName: 'Tab',
    requireLabel: iconOnly,
    warning: 'Tab: icon-only tabs require an accessibilityLabel that describes the content panel.',
  });

  const themeState = useThemeState();
  const selectAction = React.useMemo(() => resolveAccessibilityAction('select', Platform.OS, accessibilityActions), [accessibilityActions]);
  const [pressableProps, pressableState, focusBinding] = useFocusablePressable(
    {
      ...nativeRest,
      accessibilityPosInSet: tabList?.getPosition(value),
      accessibilitySetSize: tabList?.setSize,
      accessibilityRole: 'tab',
      accessibilityActions: selectAction.accessibilityActions,
      onAccessibilityAction: (event) => {
        if (!listDisabled && event.nativeEvent.actionName === selectAction.name) {
          tabList?.onTabPress(value);
        }
        onAccessibilityAction?.(event);
      },
      accessibilityState: {
        ...accessibilityState,
        disabled: listDisabled,
        selected: listSelected,
      },
      accessible: nativeRest.accessible ?? true,
      disabled: listDisabled,
      focusable: listFocusable,
      onFocus: (event) => {
        if (isSelfTargetEvent(event)) {
          tabList?.onTabFocus(value);
        }
        onFocus?.(event);
      },
      onBlur: (event) => {
        if (isSelfTargetEvent(event)) {
          tabList?.onTabBlur(value);
        }
        onBlur?.(event);
      },
      onKeyDown: (event) => {
        tabList?.onTabKeyDown(value, event);
        onKeyDown?.(event);
      },
      onPress: (event) => {
        tabList?.onTabPress(value);
        onPress?.(event);
      },
    },
    { focusOnPress: !tabList },
  );

  const { focusTarget } = focusBinding;
  React.useLayoutEffect(() => registerTab?.(value, focusTarget), [registerTab, value, focusTarget]);

  const { FocusRing, ...nativeFocusProps } = useFocusVisuals({ focused: pressableState.focused && !listDisabled });

  const root = useSlot(Pressable, {
    ...pressableProps,
    ...nativeFocusProps,
    accessibilityControls: controls,
    ref: rootRef,
  } as PropsWithRefOf<typeof Pressable> & { accessibilityControls: string });
  const icon = useOptionalSlot(Icon, iconProp);
  const selectedIcon = useOptionalSlot(Icon, selectedIconProp);
  const contentSlotProp = iconOnly ? null : (contentProp ?? 'Tab');
  const content = useOptionalSlot(Text, contentSlotProp);
  const contentHidden = useOptionalSlot(Text, contentSlotProp);

  return {
    FocusRing,
    root,
    icon,
    selectedIcon,
    content,
    contentHidden,
    disabled: listDisabled,
    layout,
    controls,
    selected: listSelected,
    value,
    iconOnly,
    userStyle,
    ...themeState,
    ...pressableState,
    ...focusBinding,
  };
}
