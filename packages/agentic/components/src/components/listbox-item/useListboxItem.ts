import * as React from 'react';
import { Platform, Pressable, Text as NativeText, View } from 'react-native';
import type {
  AccessibilityActionEvent,
  AccessibilityActionInfo,
  GestureResponderEvent,
  MouseEvent,
  NativeSyntheticEvent,
  TargetedEvent,
  ViewProps,
} from 'react-native';

import { resolveAccessibilityAction, useFocusablePressable, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import type { FocusablePressableProps, FocusKeyboardEvent } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import { composeRefs } from '../../common/composeRefs';
import { semanticIconSources } from '../../common/iconSources';
import { useFocusVisuals } from '../../common/useFocusVisuals';
import { CheckboxIndicator } from '../../primitives/checkbox-indicator/checkbox-indicator';
import { Icon } from '../../primitives/icon/icon';
import { Text } from '../text/text';
import type { ListboxItemProps, ListboxItemState } from './listbox-item.types';
import type { ListboxItemOptionAction } from './listboxItemOptionContext';
import { getListboxItemOptionLabel, ListboxItemOptionContext } from './listboxItemOptionContext';

const defaultRegularIcon = { fontSource: semanticIconSources.unselectedCircle, testID: 'listbox-item-default-icon' } as const;
const defaultFilledIcon = { fontSource: semanticIconSources.selectedCircle, testID: 'listbox-item-default-selected-icon' } as const;

// Keys an owning list handles for its options; declaring them stops the native view from also handling them.
const optionKeys = [{ key: 'Home' }, { key: 'End' }];

// Windows UI Automation dispatches lowercase selection actions; Win32 and macOS use title case.
const selectionActionNames =
  Platform.OS === 'windows'
    ? { add: 'addToSelection', remove: 'removeFromSelection' }
    : { add: 'AddToSelection', remove: 'RemoveFromSelection' };

function useNoNativeTarget(): undefined {
  return React.useMemo(() => undefined, []);
}

/** Declares select, add-to-selection, and remove-from-selection, keeping caller declarations. */
function useOptionActions(actions: readonly AccessibilityActionInfo[] | undefined) {
  return React.useMemo(() => {
    const select = resolveAccessibilityAction('select', Platform.OS, actions);
    const declared = new Set(select.accessibilityActions.map((action) => action.name));
    const extra = [selectionActionNames.add, selectionActionNames.remove]
      .filter((name) => !declared.has(name))
      .map((name) => ({ name }) as AccessibilityActionInfo);
    const names = new Map<string, ListboxItemOptionAction>([
      [select.name, 'select'],
      [selectionActionNames.add, 'add'],
      [selectionActionNames.remove, 'remove'],
    ]);
    return { accessibilityActions: [...select.accessibilityActions, ...extra], names };
  }, [actions]);
}

export function useListboxItem_unstable(props: ListboxItemProps): ListboxItemState {
  const {
    avatar: avatarProp,
    checkmark: checkmarkProp = false,
    chevron = false,
    content: contentProp,
    disabled = false,
    icon: iconProp,
    loading = false,
    multiselect: multiselectProp = false,
    ref: rootRef,
    secondaryContent: secondaryContentProp,
    secondaryContentPosition = 'right',
    selected: selectedProp = false,
    selectedIcon: selectedIconProp,
    value,
    variant = 'listItem',
    style: userStyle,
    accessibilityState,
    accessibilityRole: _accessibilityRole,
    ...rest
  } = props;

  const isListItem = variant === 'listItem';

  // The hook a list supplies stays the same for the item's lifetime in that list.
  const option = React.useContext(ListboxItemOptionContext);
  const useOptionNativeTarget = option?.useNativeTarget ?? useNoNativeTarget;
  const nativeTarget = useOptionNativeTarget();
  const bound = option !== undefined && isListItem && typeof value === 'string' ? { option, value } : undefined;
  const optionActions = useOptionActions(rest.accessibilityActions);

  const multiselect = bound ? bound.option.multiselect : multiselectProp;
  const selected = bound ? bound.option.isSelected(bound.value) : selectedProp;
  const checkmark = bound ? !multiselect : checkmarkProp;
  const label = bound
    ? getListboxItemOptionLabel({ content: contentProp, accessibilityLabel: rest.accessibilityLabel, value: bound.value })
    : undefined;
  const resolvedContentProp =
    contentProp === undefined ? { children: bound ? (rest.accessibilityLabel ?? bound.value) : 'Listbox item' } : contentProp;

  const themeState = useThemeState();
  const content = useSlot(NativeText, resolvedContentProp);
  const contentHidden = useOptionalSlot(Text, isListItem && !multiselect ? resolvedContentProp : null);
  const iconSlotProp = iconProp === null ? null : iconProp;
  const selectedIconSlotProp = selectedIconProp === null ? null : selectedIconProp;
  // A bound option renders the icon, selected icon, and secondary content only when they are supplied.
  const icon = useOptionalSlot(Icon, isListItem ? iconSlotProp : null, { defaultProps: defaultRegularIcon, renderByDefault: !bound });
  const selectedIcon = useOptionalSlot(Icon, isListItem ? selectedIconSlotProp : null, {
    defaultProps: defaultFilledIcon,
    renderByDefault: !bound,
  });
  const avatar = useOptionalSlot(View, isListItem ? avatarProp : null);
  const secondaryContent = useOptionalSlot(
    Text,
    isListItem ? (secondaryContentProp === undefined ? (bound ? null : { children: 'Secondary' }) : secondaryContentProp) : null,
    { renderByDefault: true },
  );

  const rootAccessibilityState = bound
    ? { ...accessibilityState, disabled, selected }
    : isListItem
      ? {
          ...accessibilityState,
          disabled,
          pressed: selected,
        }
      : accessibilityState;

  const optionProps: Partial<FocusablePressableProps> | undefined = bound && {
    accessibilityActions: optionActions.accessibilityActions,
    accessibilityLabel: label,
    accessibilityPosInSet: bound.option.getPosition(bound.value),
    accessibilitySetSize: bound.option.setSize,
    keyDownEvents: [...(rest.keyDownEvents ?? []), ...optionKeys],
    onAccessibilityAction: (event: AccessibilityActionEvent) => {
      const action = optionActions.names.get(event.nativeEvent.actionName);
      if (action && !disabled) {
        bound.option.onOptionAction(bound.value, action);
      }
      rest.onAccessibilityAction?.(event);
    },
    onBlur: (event: NativeSyntheticEvent<TargetedEvent>) => {
      rest.onBlur?.(event);
      bound.option.onOptionBlur(bound.value);
    },
    onFocus: (event: NativeSyntheticEvent<TargetedEvent>) => {
      rest.onFocus?.(event);
      bound.option.onOptionFocus(bound.value);
    },
    onHoverIn: (event: MouseEvent) => {
      rest.onHoverIn?.(event);
      bound.option.onOptionHoverIn(bound.value);
    },
    onKeyDown: (event: FocusKeyboardEvent) => {
      rest.onKeyDown?.(event);
      bound.option.onOptionKeyDown(bound.value, event);
    },
    onPress: (event: GestureResponderEvent) => {
      rest.onPress?.(event);
      bound.option.onOptionPress(bound.value, event);
    },
  };

  const [rootProps, pressableState, focusBinding] = useFocusablePressable({
    ...rest,
    ...optionProps,
    accessibilityRole: bound ? 'listitem' : isListItem ? 'button' : 'header',
    accessibilityState: rootAccessibilityState,
    accessible: rest.accessible ?? true,
    disabled: isListItem ? disabled : false,
    focusable: isListItem && !disabled && (rest.focusable ?? true),
  } as FocusablePressableProps);

  const { focusTarget, focusTargetRef } = focusBinding;
  const nativeTargetRef = nativeTarget?.ref;
  const hostInstance = React.useRef<object | null>(null);
  const targetRef = React.useMemo(
    () => composeRefs<object>(hostInstance, focusTargetRef, nativeTargetRef),
    [focusTargetRef, nativeTargetRef],
  );

  const register = bound?.option.register;
  const boundValue = bound?.value;
  React.useLayoutEffect(() => {
    if (!register || boundValue === undefined) {
      return undefined;
    }
    return register({
      value: boundValue,
      disabled,
      focusTarget,
      nativeTarget: nativeTarget?.target,
      getHostInstance: () => hostInstance.current,
    });
  }, [boundValue, disabled, focusTarget, nativeTarget, register]);

  const { onBlur, onFocus, onHoverIn, onHoverOut, onLongPress, onPress, onPressIn, onPressOut, ...headerRest } = rootProps;
  const headerProps: ViewProps = headerRest as unknown as ViewProps;
  const { FocusRing, ...nativeFocusProps } = useFocusVisuals({ focused: pressableState.focused && !disabled && isListItem });

  const root = useSlot(Pressable, { ...rootProps, ...nativeFocusProps, ref: rootRef });
  const header = useSlot(View, headerProps);
  const chevronIndicator = useOptionalSlot(Icon, chevron ? { fontSource: semanticIconSources.chevron } : null);
  const checkmarkIndicator = useOptionalSlot(Icon, checkmark && selected ? { fontSource: semanticIconSources.checkmark } : null);
  const checkboxIndicator = useOptionalSlot(CheckboxIndicator, multiselect ? {} : null);

  return {
    FocusRing: isListItem ? FocusRing : undefined,
    ...themeState,
    ...pressableState,
    ...focusBinding,
    focusTargetRef: targetRef,
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
