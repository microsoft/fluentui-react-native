import { Pressable, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import * as React from 'react';

import { usePressableState, useOptionalSlot, useSlot, useToggleState } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import { semanticIconSources } from '../../common/iconSources';
import { CheckboxIndicator } from '../../primitives/checkbox-indicator/checkbox-indicator';
import { Icon } from '../../primitives/icon/icon';
import type { MenuItemProps, MenuItemState } from './menu-item.types';

const defaultRegularIcon = { fontSource: semanticIconSources.unselectedCircle };
const defaultSelectedIcon = { fontSource: semanticIconSources.selectedCircle };
const defaultChevron = { fontSource: semanticIconSources.chevron };
const defaultCheckmark = { fontSource: semanticIconSources.checkmark };

export function useMenuItem_unstable(props: MenuItemProps): MenuItemState {
  const {
    accessibilityLabel,
    accessibilityHint,
    avatar: avatarProp,
    checkmark: checkmarkProp,
    chevron: chevronProp,
    content,
    defaultSelected,
    secondaryContent,
    secondaryContentPosition = 'right',
    disabled = false,
    hasCheckmark = false,
    hasChevron = false,
    hasMultiselect = false,
    loading = false,
    menuStyle = 'list-item',
    onPress,
    onSelectedChange,
    selected,
    icon: iconProp,
    selectedIcon: selectedIconProp,
    multiselectCheckbox: multiselectCheckboxProp,
    style: userStyle,
    ...rest
  } = props;

  const isListItem = menuStyle === 'list-item';
  const isInteractive = isListItem;
  const resolvedLoading = !isListItem && loading;
  const isSelectionIndicator = hasCheckmark || hasMultiselect;

  // A multiselect item toggles itself, a checkmark item only selects, and a plain command carries no selection state.
  const selection = useToggleState({
    value: selected,
    defaultValue: defaultSelected,
    onChange: onSelectedChange,
    mode: hasMultiselect ? 'toggle' : 'select',
    disabled: disabled || !isInteractive || !isSelectionIndicator,
  });

  const isSelectedVisual = selection.value && !hasMultiselect && isListItem;
  const contentText = content ?? 'Menu item';
  const secondaryContentText = secondaryContent === undefined ? 'Secondary' : secondaryContent;
  const hasSecondaryContent = secondaryContentText !== null && secondaryContentText !== undefined && secondaryContentText !== '';
  const themeState = useThemeState();

  if (__DEV__ && hasCheckmark && hasMultiselect) {
    console.warn('MenuItem: checkmark and multiselect are mutually exclusive.');
  }

  const { activate } = selection;
  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      activate();
      onPress?.(event);
    },
    [activate, onPress],
  );

  const [pressableProps, pressableState] = usePressableState({
    ...rest,
    accessible: rest.accessible ?? true,
    accessibilityHint: accessibilityHint ?? (hasChevron ? 'Has submenu' : undefined),
    accessibilityLabel: accessibilityLabel ?? contentText,
    accessibilityRole: isListItem ? (hasMultiselect ? 'menuitemcheckbox' : hasCheckmark ? 'menuitemradio' : 'menuitem') : 'none',
    accessibilityState: {
      ...props.accessibilityState,
      disabled: disabled && isInteractive,
      ...(isSelectionIndicator ? { checked: selection.value } : isSelectedVisual ? { selected: true } : {}),
    },
    disabled: !isInteractive || disabled,
    focusable: isInteractive && !disabled,
    onPress: isInteractive ? handlePress : undefined,
  });

  const root = useSlot(Pressable, pressableProps);
  const icon = useOptionalSlot(Icon, iconProp, { defaultProps: defaultRegularIcon, renderByDefault: true });
  const selectedIcon = useOptionalSlot(Icon, selectedIconProp, { defaultProps: defaultSelectedIcon, renderByDefault: selection.value });
  const avatar = useOptionalSlot(View, avatarProp);
  const chevronSlot = useOptionalSlot(Icon, chevronProp, { defaultProps: defaultChevron, renderByDefault: hasChevron });
  const checkmarkSlot = useOptionalSlot(Icon, checkmarkProp, { defaultProps: defaultCheckmark, renderByDefault: hasCheckmark });
  const multiselectCheckbox = useOptionalSlot(CheckboxIndicator, multiselectCheckboxProp, { renderByDefault: hasMultiselect });

  const styleState: MenuItemState = {
    ...themeState,
    ...pressableState,
    contentText,
    disabled,
    hasCheckmark,
    hasChevron,
    hasMultiselect,
    hasSecondaryContent,
    icon,
    isListItem,
    isSelectedVisual,
    loading: resolvedLoading,
    menuStyle,
    multiselectCheckbox,
    secondaryContentPosition,
    secondaryContentText,
    selected: selection.value,
    selectedIcon,
    userStyle,
    rootAccessibilityHint: pressableProps.accessibilityHint,
    rootAccessibilityLabel: pressableProps.accessibilityLabel ?? contentText,
    root,
    avatar,
    checkmark: checkmarkSlot,
    chevron: chevronSlot,
  };

  return styleState;
}
