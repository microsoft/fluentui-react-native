import { getComponentTokens } from '@fluentui-react-native/design/styling';
import {
  resolveAccessibilityAction,
  useAccessibilityLabelWarning,
  useOptionalSlot,
  useToggleState,
} from '@fluentui-react-native/framework-base';
import { Platform } from 'react-native';
import { useButton_unstable } from '../button/useButton';
import { Text } from '../text/text';
import { toggleButtonTokenDefinition } from './toggle-button.styles';
import type { ToggleButtonProps, ToggleButtonState } from './toggle-button.types';

export function useToggleButton_unstable(props: ToggleButtonProps): ToggleButtonState {
  const {
    accessibilityActions,
    accessibilityState,
    content,
    defaultSelected,
    disabled = false,
    leadingIcon,
    onAccessibilityAction,
    onPress,
    onSelectedChange,
    selected,
    selectedLeadingIcon,
    selectedTrailingIcon,
    trailingIcon,
    ...root
  } = props;
  const selection = useToggleState({ value: selected, defaultValue: defaultSelected, onChange: onSelectedChange, disabled });
  const action = resolveAccessibilityAction('toggle', Platform.OS, accessibilityActions);
  const actions =
    Platform.OS === 'macos'
      ? action.accessibilityActions.map((entry) =>
          entry.name === action.name && entry.label == null ? { ...entry, label: action.name } : entry,
        )
      : action.accessibilityActions;
  const state = useButton_unstable({
    ...root,
    accessibilityActions: actions,
    accessibilityState: { ...accessibilityState, checked: selection.value },
    'aria-checked': selection.value,
    appearance: 'subtle',
    content,
    disabled,
    leadingIcon: selection.value ? (selectedLeadingIcon ?? leadingIcon) : leadingIcon,
    trailingIcon: selection.value ? (selectedTrailingIcon ?? trailingIcon) : trailingIcon,
    onPress: (event) => {
      if (!disabled) {
        selection.toggle();
        onPress?.(event);
      }
    },
    onAccessibilityAction: (event) => {
      if (event.nativeEvent.actionName === action.name) selection.toggle();
      onAccessibilityAction?.(event);
    },
  });
  const label = content && typeof content === 'object' && 'children' in content ? content.children : content;
  useAccessibilityLabelWarning({
    accessibilityLabel: root.accessibilityLabel ?? root['aria-label'],
    accessibilityLabelledBy: root.accessibilityLabelledBy ?? root['aria-labelledby'],
    componentName: 'ToggleButton',
    requireLabel: content != null && typeof label !== 'string' && typeof label !== 'number',
    warning: 'ToggleButton: rich content requires an explicit accessible name.',
  });
  return {
    ...state,
    selected: selection.value,
    contentHidden: useOptionalSlot(Text, content, (props) => ({ ...props, ref: undefined, testID: undefined })),
    toggleButtonTokens: getComponentTokens(state.themeState, toggleButtonTokenDefinition),
  };
}
