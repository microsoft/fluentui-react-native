import { Pressable, Text as NativeText, View } from 'react-native';
import type { ViewProps } from 'react-native';

import { usePressableState, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import { semanticIconSources } from '../../common/iconSources';
import { CheckboxIndicator } from '../../primitives/checkbox-indicator/checkbox-indicator';
import { Icon } from '../../primitives/icon/icon';
import { Text } from '../text/text';
import type { ListboxItemProps, ListboxItemState } from './listbox-item.types';

const defaultRegularIcon = { fontSource: semanticIconSources.unselectedCircle, testID: 'listbox-item-default-icon' } as const;
const defaultFilledIcon = { fontSource: semanticIconSources.selectedCircle, testID: 'listbox-item-default-selected-icon' } as const;
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
    ref: rootRef,
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
  const content = useSlot(NativeText, contentProp);
  const contentHidden = useOptionalSlot(Text, isListItem && !multiselect ? contentProp : null);
  const iconSlotProp = iconProp === null ? null : iconProp;
  const selectedIconSlotProp = selectedIconProp === null ? null : selectedIconProp;
  const icon = useOptionalSlot(Icon, isListItem ? iconSlotProp : null, { defaultProps: defaultRegularIcon, renderByDefault: true });
  const selectedIcon = useOptionalSlot(Icon, isListItem ? selectedIconSlotProp : null, {
    defaultProps: defaultFilledIcon,
    renderByDefault: true,
  });
  const avatar = useOptionalSlot(View, isListItem ? avatarProp : null);
  const secondaryContent = useOptionalSlot(
    Text,
    isListItem ? (secondaryContentProp === undefined ? { children: 'Secondary' } : secondaryContentProp) : null,
    { renderByDefault: true },
  );

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

  const { onBlur, onFocus, onHoverIn, onHoverOut, onLongPress, onPress, onPressIn, onPressOut, ...headerRest } = rootProps;
  const headerProps: ViewProps = headerRest as unknown as ViewProps;
  const root = useSlot(Pressable, { ...rootProps, ref: rootRef });
  const header = useSlot(View, headerProps);
  const chevronIndicator = useOptionalSlot(Icon, chevron ? { fontSource: semanticIconSources.chevron } : null);
  const checkmarkIndicator = useOptionalSlot(Icon, checkmark && selected ? { fontSource: semanticIconSources.checkmark } : null);
  const checkboxIndicator = useOptionalSlot(CheckboxIndicator, multiselect ? {} : null);

  return {
    ...themeState,
    ...pressableState,
    avatar,
    checkboxIndicator,
    checkmark,
    checkmarkIndicator,
    chevron,
    chevronIndicator,
    content,
    contentHidden,
    disabled,
    header,
    icon,
    loading,
    multiselect,
    root,
    secondaryContent,
    secondaryContentPosition,
    selected,
    selectedIcon,
    userStyle,
    variant,
  };
}
