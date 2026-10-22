import * as React from 'react';
import { Pressable, View } from 'react-native';
import type { GestureResponderEvent, MouseEvent, NativeSyntheticEvent, TargetedEvent } from 'react-native';

import { useFocusablePressable, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import type { FocusablePressableProps, FocusKeyboardEvent } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import { isKeyboardPress } from '../../common/eventHandlers';
import { semanticIconSources } from '../../common/iconSources';
import { withTriggerExpandActions } from '../../common/triggerExpandActions';
import { useFocusVisuals } from '../../common/useFocusVisuals';
import { CheckboxIndicator } from '../../primitives/checkbox-indicator/checkbox-indicator';
import { Icon } from '../../primitives/icon/icon';
import type { MenuItemProps, MenuItemState } from './menu-item.types';
import { MenuItemMenuContext } from './menuItemContext';

const defaultRegularIcon = { fontSource: semanticIconSources.unselectedCircle };
const defaultSelectedIcon = { fontSource: semanticIconSources.selectedCircle };
const defaultChevron = { fontSource: semanticIconSources.chevron };
const defaultCheckmark = { fontSource: semanticIconSources.checkmark };

// Keys a Menu handles for its rows; declaring them stops the native view from also handling them.
const menuRowKeys = [{ key: 'ArrowLeft' }, { key: 'ArrowRight' }, { key: 'Home' }, { key: 'End' }];

export function useMenuItem_unstable(props: MenuItemProps): MenuItemState {
  const {
    accessibilityLabel,
    accessibilityHint,
    avatar: avatarProp,
    checkmark: checkmarkProp,
    chevron: chevronProp,
    content,
    secondaryContent,
    secondaryContentPosition = 'right',
    disabled = false,
    disabledFocusable: disabledFocusableProp,
    hasCheckmark = false,
    hasChevron = false,
    hasMultiselect = false,
    loading = false,
    menuStyle = 'list-item',
    selected = false,
    icon: iconProp,
    selectedIcon: selectedIconProp,
    multiselectCheckbox: multiselectCheckboxProp,
    ref: rootRef,
    style: userStyle,
    submenu,
    ...rest
  } = props;

  const menu = React.useContext(MenuItemMenuContext);
  const disabledFocusable = disabledFocusableProp ?? menu?.disabledFocusable ?? false;
  const isListItem = menuStyle === 'list-item';
  const isInteractive = isListItem;
  const resolvedLoading = !isListItem && loading;
  const isSelectionIndicator = hasCheckmark || hasMultiselect;

  const isSelectedVisual = selected && !hasMultiselect && isListItem;
  const contentText = content ?? 'Menu item';
  const secondaryContentText = secondaryContent === undefined ? 'Secondary' : secondaryContent;
  const hasSecondaryContent = secondaryContentText !== null && secondaryContentText !== undefined && secondaryContentText !== '';
  const themeState = useThemeState();

  if (__DEV__ && hasCheckmark && hasMultiselect) {
    console.warn('MenuItem: checkmark and multiselect are mutually exclusive.');
  }

  const menuRowId = React.useId();
  const inMenu = menu !== undefined && isListItem;
  const hasSubmenu = isListItem && submenu !== undefined;
  const submenuOpen = inMenu && hasSubmenu && menu.isSubmenuOpen(menuRowId);
  React.useEffect(() => {
    if (__DEV__ && submenu !== undefined && !inMenu) {
      console.warn('MenuItem: a submenu opens only from a list row inside a Menu.');
    }
  }, [inMenu, submenu]);
  const showChevron = hasChevron || hasSubmenu;
  const rowFocusable = isInteractive && (!disabled || disabledFocusable);
  const menuHandlers = inMenu
    ? {
        onBlur: (event: NativeSyntheticEvent<TargetedEvent>) => {
          rest.onBlur?.(event);
          menu.onRowBlur(menuRowId);
        },
        onFocus: (event: NativeSyntheticEvent<TargetedEvent>) => {
          rest.onFocus?.(event);
          menu.onRowFocus(menuRowId);
        },
        onHoverIn: (event: MouseEvent) => {
          rest.onHoverIn?.(event);
          menu.onRowHoverIn(menuRowId);
        },
        onHoverOut: (event: MouseEvent) => {
          rest.onHoverOut?.(event);
          menu.onRowHoverOut(menuRowId);
        },
        onKeyDown: (event: FocusKeyboardEvent) => {
          rest.onKeyDown?.(event);
          menu.onRowKeyDown(menuRowId, event);
        },
        onPress: (event: GestureResponderEvent) => {
          rest.onPress?.(event);
          menu.onRowPress(menuRowId, isKeyboardPress(event));
        },
        keyDownEvents: [...(rest.keyDownEvents ?? []), ...menuRowKeys],
      }
    : undefined;

  const rowProps: FocusablePressableProps = {
    ...rest,
    accessible: rest.accessible ?? true,
    ...menuHandlers,
    accessibilityHint: accessibilityHint ?? (showChevron ? 'Has submenu' : undefined),
    accessibilityLabel: accessibilityLabel ?? contentText,
    accessibilityRole: isListItem ? (hasMultiselect ? 'menuitemcheckbox' : hasCheckmark ? 'menuitemradio' : 'menuitem') : 'none',
    accessibilityState: {
      ...props.accessibilityState,
      disabled: disabled && isInteractive,
      ...(isSelectionIndicator ? { checked: selected } : isSelectedVisual ? { selected: true } : {}),
      ...(inMenu && hasSubmenu && { expanded: submenuOpen }),
    },
    disabled: !isInteractive || disabled,
    focusable: rowFocusable,
    onPress: isInteractive ? (menuHandlers?.onPress ?? rest.onPress) : undefined,
  };
  const [pressableProps, pressableState, focusBinding] = useFocusablePressable(
    inMenu && hasSubmenu
      ? withTriggerExpandActions(rowProps, (expanded) => {
          if (expanded !== submenuOpen) {
            menu.onRowPress(menuRowId, true);
          }
        })
      : rowProps,
    { disabledFocusable: isInteractive && disabledFocusable },
  );

  const { FocusRing, ...nativeFocusProps } = useFocusVisuals({
    focused: pressableState.focused && (!disabled || disabledFocusable) && isInteractive,
    useSystemFocusRing: isInteractive ? undefined : false,
  });

  const root = useSlot(Pressable, { ...pressableProps, ...nativeFocusProps, ref: rootRef });
  const icon = useOptionalSlot(Icon, iconProp, { defaultProps: defaultRegularIcon, renderByDefault: true });
  const selectedIcon = useOptionalSlot(Icon, selectedIconProp, { defaultProps: defaultSelectedIcon, renderByDefault: selected });
  const avatar = useOptionalSlot(View, avatarProp);
  const chevronSlot = useOptionalSlot(Icon, chevronProp, { defaultProps: defaultChevron, renderByDefault: showChevron });

  const { focusTarget } = focusBinding;
  const register = inMenu ? menu.register : undefined;
  React.useLayoutEffect(() => {
    if (!register) {
      return undefined;
    }
    return register({
      id: menuRowId,
      text: contentText,
      hasSubmenu,
      focusable: rowFocusable,
      focus: () => {
        focusTarget.requestFocus('keyboard');
      },
    });
  }, [contentText, focusTarget, hasSubmenu, menuRowId, register, rowFocusable]);
  const checkmarkSlot = useOptionalSlot(Icon, checkmarkProp, { defaultProps: defaultCheckmark, renderByDefault: hasCheckmark });
  const multiselectCheckbox = useOptionalSlot(CheckboxIndicator, multiselectCheckboxProp, { renderByDefault: hasMultiselect });

  const styleState: MenuItemState = {
    FocusRing: isInteractive ? FocusRing : undefined,
    ...themeState,
    ...pressableState,
    ...focusBinding,
    contentText,
    disabled,
    disabledFocusable,
    hasCheckmark,
    hasChevron: showChevron,
    hasMultiselect,
    hasSecondaryContent,
    icon,
    isListItem,
    isSelectedVisual,
    loading: resolvedLoading,
    menuRowId: inMenu ? menuRowId : undefined,
    menuStyle,
    multiselectCheckbox,
    secondaryContentPosition,
    secondaryContentText,
    selected,
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
