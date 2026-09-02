import { Pressable, View } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import {
  type PropsWithRefOf,
  useAccessibilityLabelWarning,
  useOptionalSlot,
  usePressableState,
  useSlot,
} from '@fluentui-react-native/framework-base';

import { semanticIconSources } from '../../common/iconSources';
import { Icon } from '../../primitives/icon/icon';
import { Avatar } from '../avatar/avatar';
import { Text } from '../text/text';

import { getNavItemLeadingSize } from './nav-item.styles';
import type { NavItemMetrics, NavItemProps, NavItemState } from './nav-item.types';

const defaultChevronSource = semanticIconSources.chevron;

function getMetrics(density: NavItemState['density'], nesting: NavItemState['nesting'], tokens: NavItemState['tokens']): NavItemMetrics {
  const { spacing, strokeWidth } = tokens;
  const leadingSize = getNavItemLeadingSize(density);
  const compact = density === 'compact';
  const rootPaddingHorizontal = compact ? spacing.componentBase200 : spacing.componentBase300;
  const subItemIndent = nesting === 'subItem' ? spacing.layoutBase200 : 0;

  return {
    avatarSize: compact ? 16 : 20,
    chevronSize: leadingSize,
    indicatorInsetStart: spacing.componentBase50,
    indicatorInsetVertical: spacing.componentBase150,
    indicatorWidth: strokeWidth.thicker,
    leadingGap: compact ? spacing.componentBase100 : spacing.componentBase150,
    leadingSize,
    rootPaddingHorizontal,
    rootPaddingStart: rootPaddingHorizontal + subItemIndent,
    rootPaddingVertical: compact ? spacing.componentBase150 : spacing.componentBase250,
    trailingGap: compact ? spacing.componentBase150 : spacing.componentBase200,
    trailingItemGap: spacing.componentBase100,
  };
}

/**
 * Hook to create the state for a NavItem component.
 */
export function useNavItem_unstable(props: NavItemProps): NavItemState {
  const {
    accessibilityState,
    avatar: avatarProp,
    controls,
    density = 'comfortable',
    disabled = false,
    expanded = false,
    icon: iconProp,
    label: labelProp,
    nesting = 'topLevel',
    ref: rootRef,
    selected = false,
    selectedIcon: selectedIconProp,
    showLabel = true,
    style: userStyle,
    trailingActions: trailingActionsProp,
    trailingContent: trailingContentProp,
    type = 'item',
    ...rest
  } = props;

  const category = type === 'category';
  const themeState = useThemeState();
  const metrics = getMetrics(density, nesting, themeState.tokens);
  const resolvedAccessibilityState = { ...accessibilityState };
  if (category) {
    delete resolvedAccessibilityState.selected;
  }

  useAccessibilityLabelWarning({
    accessibilityLabel: rest.accessibilityLabel ?? rest['aria-label'],
    accessibilityLabelledBy: rest.accessibilityLabelledBy ?? rest['aria-labelledby'],
    componentName: 'NavItem',
    requireLabel: !showLabel,
    warning: 'NavItem: a collapsed rail row requires an accessibilityLabel that names the destination.',
  });

  const [pressableProps, pressableState] = usePressableState({
    ...rest,
    accessibilityRole: category ? 'button' : 'link',
    accessibilityState: {
      ...resolvedAccessibilityState,
      disabled,
      ...(category ? { expanded } : { selected }),
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: !disabled && (rest.focusable ?? true),
  });

  const root = useSlot(Pressable, {
    ...pressableProps,
    ...(category && controls ? { accessibilityControls: controls } : undefined),
    ref: rootRef,
  } as PropsWithRefOf<typeof Pressable> & { accessibilityControls: string });

  const labelSlotProp = showLabel ? (labelProp ?? 'Nav item') : null;
  const label = useOptionalSlot(Text, labelSlotProp);
  const labelHidden = useOptionalSlot(Text, labelSlotProp);
  const icon = useOptionalSlot(Icon, iconProp);
  const selectedIcon = useOptionalSlot(Icon, selectedIconProp);
  const avatar = useOptionalSlot(Avatar, avatarProp);
  const trailingContent = useOptionalSlot(Text, showLabel ? trailingContentProp : null);
  const trailingActions = useOptionalSlot(View, showLabel ? trailingActionsProp : null);
  const showChevron = category && showLabel;
  const chevronContainer = useOptionalSlot(View, showChevron ? { testID: 'nav-item-chevron' } : null);
  const chevron = useOptionalSlot(Icon, showChevron ? { fontSource: defaultChevronSource, testID: 'nav-item-chevron-icon' } : null);
  const selectedIndicator = useSlot(View, { testID: 'nav-item-selected-indicator' });

  return {
    root,
    avatar,
    chevron,
    chevronContainer,
    icon,
    label,
    labelHidden,
    selectedIcon,
    selectedIndicator,
    trailingActions,
    trailingContent,
    controls,
    density,
    disabled,
    expanded,
    metrics,
    nesting,
    selected,
    showLabel,
    type,
    userStyle,
    ...themeState,
    ...pressableState,
  };
}
