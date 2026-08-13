import { Text, View } from 'react-native';
import type { ViewProps } from 'react-native';

import { usePressableState, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import { Icon } from '../../primitives/icon/icon';
import type { ListboxItemProps, ListboxItemState } from './listbox-item.types';

const defaultRegularIcon = { fontSource: { codepoint: 0x25cb, fontFamily: 'Arial' }, testID: 'listbox-item-default-icon' } as const;
const defaultFilledIcon = { fontSource: { codepoint: 0x25cf, fontFamily: 'Arial' }, testID: 'listbox-item-default-selected-icon' } as const;
export function useListboxItem_unstable(props: ListboxItemProps): ListboxItemState {
  const {
    avatar: avatarProp,
    checkmark = false,
    chevron = false,
    content: contentProp = { children: 'Listbox item' },
    disabled = false,
    icon: iconProp,
    loading = false,
    multiselect = false,
    secondaryContent: secondaryContentProp,
    secondaryContentPosition = 'right',
    selected = false,
    selectedIcon: selectedIconProp,
    variant = 'listItem',
    style: userStyle,
    accessibilityState,
    accessibilityRole: _accessibilityRole,
    ...rest
  } = props;

  const isListItem = variant === 'listItem';
  const themeState = useThemeState();
  const content = useSlot(Text, contentProp);
  const contentHidden = isListItem && !multiselect ? useSlot(Text, contentProp) : undefined;
  const iconSlotProp = iconProp === null ? null : iconProp;
  const selectedIconSlotProp = selectedIconProp === null ? null : selectedIconProp;
  const icon = isListItem ? useOptionalSlot(Icon, iconSlotProp, { defaultProps: defaultRegularIcon, renderByDefault: true }) : undefined;
  const selectedIcon = isListItem
    ? useOptionalSlot(Icon, selectedIconSlotProp, { defaultProps: defaultFilledIcon, renderByDefault: true })
    : undefined;
  const avatar = isListItem ? useOptionalSlot(View, avatarProp) : undefined;
  const secondaryContent = isListItem
    ? useOptionalSlot(Text, secondaryContentProp === undefined ? { children: 'Secondary' } : secondaryContentProp, {
        renderByDefault: true,
      })
    : undefined;

  const rootAccessibilityState = isListItem
    ? {
        ...accessibilityState,
        disabled,
        pressed: selected,
      }
    : accessibilityState;

  const [rootProps, pressableState] = usePressableState({
    ...rest,
    accessibilityRole: isListItem ? 'button' : 'header',
    accessibilityState: rootAccessibilityState,
    accessible: rest.accessible ?? true,
    disabled: isListItem ? disabled : false,
    focusable: rest.focusable ?? (isListItem && !disabled),
  });

  if (isListItem) {
    rootProps.accessibilityState = {
      ...(rootProps.accessibilityState as Record<string, unknown> | undefined),
      disabled,
      pressed: selected,
    } as never;
  }

  const { onBlur, onFocus, onHoverIn, onHoverOut, onLongPress, onPress, onPressIn, onPressOut, ...headerRest } = rootProps;
  const headerProps: ViewProps = headerRest as unknown as ViewProps;

  return {
    ...themeState,
    ...pressableState,
    avatar,
    checkmark,
    chevron,
    content,
    contentHidden,
    disabled,
    headerProps,
    icon,
    loading,
    multiselect,
    rootProps,
    secondaryContent,
    secondaryContentPosition,
    selected,
    selectedIcon,
    userStyle,
    variant,
  };
}
