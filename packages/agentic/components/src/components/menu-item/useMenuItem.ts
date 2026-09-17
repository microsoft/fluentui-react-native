import { Pressable, View } from 'react-native';

import { useDevWarning, usePressableState, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import { resolveFocusable } from '../../common/interaction';
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
    secondaryContent,
    secondaryContentPosition = 'right',
    disabled = false,
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
    ...rest
  } = props;

  const isListItem = menuStyle === 'list-item';
  const isInteractive = isListItem;
  const resolvedLoading = !isListItem && loading;
  const isSelectionIndicator = hasCheckmark || hasMultiselect;

  const isSelectedVisual = selected && !hasMultiselect && isListItem;
  const contentText = content ?? 'Menu item';
  const secondaryContentText = secondaryContent === undefined ? 'Secondary' : secondaryContent;
  const hasSecondaryContent = secondaryContentText !== null && secondaryContentText !== undefined && secondaryContentText !== '';
  const themeState = useThemeState();

  useDevWarning(hasCheckmark && hasMultiselect, 'MenuItem: checkmark and multiselect are mutually exclusive.');

  const [pressableProps, pressableState] = usePressableState({
    ...rest,
    accessible: rest.accessible ?? true,
    accessibilityHint: accessibilityHint ?? (hasChevron ? 'Has submenu' : undefined),
    accessibilityLabel: accessibilityLabel ?? contentText,
    role: isListItem ? 'menuitem' : 'none',
    accessibilityState: {
      ...props.accessibilityState,
      disabled: disabled && isInteractive,
      ...(isSelectionIndicator ? { checked: selected } : isSelectedVisual ? { selected: true } : {}),
    },
    disabled: !isInteractive || disabled,
    focusable: isInteractive && resolveFocusable(rest.focusable, disabled),
    onPress: isInteractive ? rest.onPress : undefined,
  });

  const root = useSlot(Pressable, { ...pressableProps, ref: rootRef });
  const icon = useOptionalSlot(Icon, iconProp, { defaultProps: defaultRegularIcon, renderByDefault: true });
  const selectedIcon = useOptionalSlot(Icon, selectedIconProp, { defaultProps: defaultSelectedIcon, renderByDefault: selected });
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
