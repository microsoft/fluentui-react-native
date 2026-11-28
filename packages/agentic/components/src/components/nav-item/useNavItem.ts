import { Pressable, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useFocusablePressable, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { semanticIconSources } from '../../common/iconSources';
import { withTriggerExpandActions } from '../../common/triggerExpandActions';
import { useFocusVisuals } from '../../common/useFocusVisuals';
import { Icon } from '../../primitives/icon/icon';
import { Avatar } from '../avatar/avatar';
import { Badge } from '../badge/badge';
import { isNavigationPress } from '../link/linkActivation';
import { Text } from '../text/text';
import type { NavItemProps, NavItemState } from './nav-item.types';

export function useNavItem_unstable({
  value,
  label,
  type,
  onNavigate,
  onExpandedChange,
  expanded,
  current,
  currentDescription,
  carriedCurrent,
  leading,
  badge,
  secondaryActions = [],
  disabled = false,
  iconOnly = false,
  density = 'comfortable',
  nesting = 'top-level',
  primary,
  style: userStyle,
  ...rootProps
}: NavItemProps): NavItemState {
  const category = type === 'category';
  const valid =
    !!value.trim() &&
    !!label.trim() &&
    (category
      ? typeof onExpandedChange === 'function' && typeof expanded === 'boolean' && onNavigate === undefined
      : typeof onNavigate === 'function' && onExpandedChange === undefined);
  const inactive = disabled || !valid;
  const highlighted = category ? !expanded && carriedCurrent === true : current === true;
  const currentValue = !category && current && currentDescription?.trim() ? currentDescription : undefined;
  const badgeLabel = badge?.accessible !== false && badge?.accessibilityLabel?.trim() ? badge.accessibilityLabel : undefined;
  const hint = [primary?.accessibilityHint, badgeLabel].filter(Boolean).join('\n') || undefined;
  const setExpanded = (next: boolean) => {
    if (!inactive && category && next !== expanded) onExpandedChange?.(next);
  };
  const activate = () => {
    if (inactive) return;
    if (category) setExpanded(!expanded);
    else onNavigate?.(value);
  };
  useAccessibilityLabelWarning({
    componentName: 'NavItem',
    accessibilityLabel: valid ? label : undefined,
    requireLabel: true,
    warning: 'NavItem: give a row a nonblank key and label, and one destination or disclosure operation.',
  });
  const [pressedProps, pressable, focus] = useFocusablePressable({
    ...primary,
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityValue: currentValue ? { text: currentValue } : undefined,
    accessibilityRole: category ? 'button' : 'link',
    accessibilityState: { disabled: inactive, ...(category && { expanded }) },
    disabled: inactive,
    focusable: !inactive,
    onPress: (event) => {
      if (category || isNavigationPress(event)) activate();
    },
    onAccessibilityTap: inactive ? undefined : activate,
  });
  const { FocusRing, ...nativeFocus } = useFocusVisuals({ focused: pressable.focused && !inactive });
  const row = { ...pressedProps, ...nativeFocus, ref: primary?.ref };
  const actions = secondaryActions.filter(
    (action, index) =>
      !!action.label.trim() && !!action.key.trim() && secondaryActions.findIndex((entry) => entry.key === action.key) === index,
  );
  return {
    ...useThemeState(),
    ...focus,
    FocusRing,
    density,
    nesting,
    highlighted,
    disabled: inactive,
    actions,
    visualState: inactive ? 'disabled' : pressable.pressed ? 'pressed' : pressable.hovered ? 'hovered' : 'rest',
    userStyle,
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false }),
    primary: useSlot(Pressable, category && !inactive ? withTriggerExpandActions(row, setExpanded) : row),
    icon: useOptionalSlot(Icon, leading?.kind === 'icon' ? leading.icon : null, {
      transform: (props) => ({ ...props, ...hiddenFromAccessibilityProps }),
    }),
    avatar: useOptionalSlot(Avatar, leading?.kind === 'avatar' ? { ...leading.avatar, ...hiddenFromAccessibilityProps } : null),
    label: useOptionalSlot(Text, iconOnly && leading ? null : { ...hiddenFromAccessibilityProps, children: label }),
    badge: useOptionalSlot(Badge, badge ? { ...badge, ...hiddenFromAccessibilityProps } : null),
    chevron: useOptionalSlot(
      Icon,
      category
        ? { ...hiddenFromAccessibilityProps, fontSource: expanded ? semanticIconSources.chevronUp : semanticIconSources.chevronDown }
        : null,
    ),
    indicator: useOptionalSlot(View, highlighted ? { ...hiddenFromAccessibilityProps, pointerEvents: 'none' } : null),
  };
}
