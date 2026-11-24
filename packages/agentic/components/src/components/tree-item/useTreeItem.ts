import { I18nManager, Platform, Pressable, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import {
  resolveAccessibilityAction,
  useAccessibilityLabelWarning,
  useFocusablePressable,
  useOptionalSlot,
  useSlot,
} from '@fluentui-react-native/framework-base';
import type { FocusKeyboardEvent } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { semanticIconSources } from '../../common/iconSources';
import { withTriggerExpandActions } from '../../common/triggerExpandActions';
import { useFocusVisuals } from '../../common/useFocusVisuals';
import { Icon } from '../../primitives/icon/icon';
import { Avatar } from '../avatar/avatar';
import { Badge } from '../badge/badge';
import { Button } from '../button/button';
import { commandPressProps } from '../button/commandPress';
import { Text } from '../text/text';
import type { TreeItemInteraction, TreeItemProps, TreeItemState } from './tree-item.types';

export function useTreeItem_unstable(props: TreeItemProps): TreeItemState {
  return useTreeItem(props);
}

export function useTreeItem(
  {
    value,
    label,
    level,
    position,
    setSize,
    expanded,
    onExpandedChange,
    onActivate,
    selected,
    checked,
    onSelection,
    description,
    icon,
    avatar,
    badge,
    quickAction,
    children,
    primaryTestID,
    disabled = false,
    focusable = true,
    size = 'medium',
    appearance = 'subtle',
    layout = 'standard',
    style: userStyle,
    ...rootProps
  }: TreeItemProps,
  input?: TreeItemInteraction,
): TreeItemState {
  const valid = !!value.trim() && !!label.trim() && Number.isInteger(level) && level > 0;
  const inactive = disabled || !valid;
  const invokeLeaf: ((key: string) => void) | undefined = onActivate;
  const select = resolveAccessibilityAction(checked === undefined ? 'select' : 'toggle', Platform.OS, [
    {
      name: checked === undefined ? 'Select' : 'Toggle',
      label,
    },
  ]);
  const disclose = (next: boolean) => {
    if (!inactive && expanded !== undefined && expanded !== next) onExpandedChange?.(next, value);
  };
  const primary = () => {
    if (inactive) return;
    if (expanded !== undefined) disclose(!expanded);
    else invokeLeaf?.(value);
  };
  useAccessibilityLabelWarning({
    componentName: 'TreeItem',
    accessibilityLabel: valid ? label : undefined,
    requireLabel: true,
    warning: 'TreeItem: provide a stable key, valid level, and localized label.',
  });
  const projection = {
    accessibilityLevel: level,
    accessibilityPosInSet: position,
    accessibilitySetSize: setSize,
  };
  const [pressProps, interaction, binding] = useFocusablePressable({
    ...input,
    ...projection,
    role: 'treeitem',
    testID: primaryTestID,
    accessibilityLabel: label,
    accessibilityHint: description,
    accessibilityState: { disabled: inactive, expanded, selected, checked },
    accessible: true,
    disabled: inactive,
    focusable: !inactive && focusable,
    onAccessibilityTap: inactive ? undefined : primary,
    accessibilityActions: !inactive && onSelection ? select.accessibilityActions : undefined,
    onAccessibilityAction: (event) => {
      if (!inactive && event.nativeEvent.actionName === select.name) onSelection?.(value);
    },
    onPress: (event) => {
      const { key, code } = (event?.nativeEvent as FocusKeyboardEvent['nativeEvent'] | undefined) ?? {};
      if (key === ' ' || key === 'Spacebar' || code === 'Space') {
        if (!inactive) onSelection?.(value);
      } else {
        primary();
      }
    },
  });
  const { FocusRing, ...nativeFocus } = useFocusVisuals({ focused: interaction.focused && !inactive });
  const row = { ...pressProps, ...nativeFocus };
  const arrow = expanded ? semanticIconSources.chevronDown : { codepoint: I18nManager.isRTL ? 0x2039 : 0x203a };
  return {
    ...useThemeState(),
    ...binding,
    FocusRing,
    level,
    size,
    layout,
    appearance,
    visualState: inactive ? 'disabled' : interaction.pressed ? 'pressed' : interaction.hovered ? 'hovered' : 'rest',
    selected: selected === true || checked === true,
    children,
    userStyle,
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false }),
    row: useSlot(View, {}),
    primary: useSlot(Pressable, expanded !== undefined && !inactive ? withTriggerExpandActions(row, disclose) : row),
    disclosure: useSlot(View, { ...hiddenFromAccessibilityProps, pointerEvents: 'none' }),
    chevron: useOptionalSlot(Icon, expanded === undefined ? null : { ...hiddenFromAccessibilityProps, fontSource: arrow }),
    mark: useOptionalSlot(
      Icon,
      layout === 'checkbox' && checked !== undefined
        ? {
            ...hiddenFromAccessibilityProps,
            fontSource:
              checked === 'mixed' ? semanticIconSources.indeterminate : checked ? semanticIconSources.checkmark : { codepoint: 0x25a1 },
          }
        : null,
    ),
    icon: useOptionalSlot(Icon, icon, { transform: (props) => ({ ...props, ...hiddenFromAccessibilityProps }) }),
    avatar: useOptionalSlot(
      Avatar,
      layout === 'avatar' && avatar ? { ...avatar, ...hiddenFromAccessibilityProps, pointerEvents: 'none' } : null,
    ),
    badge: useOptionalSlot(Badge, badge ? { ...badge, ...hiddenFromAccessibilityProps, pointerEvents: 'none' } : null),
    copy: useSlot(View, hiddenFromAccessibilityProps),
    label: useSlot(Text, { ...hiddenFromAccessibilityProps, children: label }),
    description: useOptionalSlot(Text, description?.trim() ? { ...hiddenFromAccessibilityProps, children: description } : null),
    action: useOptionalSlot(
      Button,
      quickAction?.label.trim()
        ? {
            ...commandPressProps(() => {
              if (!inactive) quickAction.onPress(value);
            }, inactive),
            onFocus: input?.onFocus,
            onBlur: input?.onBlur,
            disabled: inactive,
            content: quickAction.label,
            size: 'small',
            appearance: 'subtle',
          }
        : null,
    ),
    branch: useOptionalSlot(View, expanded && children != null ? { role: 'group', focusable: false } : null),
  };
}
