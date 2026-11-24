import { useLayoutEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import type { TextInputSubmitEditingEvent } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import {
  useAccessibilityLabelWarning,
  useControllableValue,
  useFocusTarget,
  useOptionalSlot,
  useSlot,
} from '@fluentui-react-native/framework-base';
import type { FocusKeyboardEvent } from '@fluentui-react-native/framework-base';
import { semanticIconSources } from '../../common/iconSources';
import { Button } from '../button/button';
import { commandPressProps } from '../button/commandPress';
import type { SearchBoxProps, SearchBoxState } from './search-box.types';

export function useSearchBox_unstable({
  accessibilityLabel,
  clearLabel,
  placeholder,
  value,
  defaultValue = '',
  onChangeText,
  onSubmitQuery,
  size = 'medium',
  variant = 'outline',
  disabled = false,
  textInput,
  style: userStyle,
  ...rootProps
}: SearchBoxProps): SearchBoxState {
  const [query = '', setQuery] = useControllableValue(value, defaultValue);
  const [restoreVersion, requestRestore] = useState(0);
  const consumedRestore = useRef(0);
  const { focusTarget, focusTargetRef, onFocus, onBlur } = useFocusTarget(!disabled);
  useLayoutEffect(() => {
    if (restoreVersion === consumedRestore.current) return undefined;
    consumedRestore.current = restoreVersion;
    if (disabled) return undefined;
    const request = focusTarget.requestFocus('restore');
    return () => request.cancel();
  }, [disabled, focusTarget, restoreVersion]);

  const canClear = !!query && !!clearLabel.trim();
  const change = (next: string) => {
    if (disabled || next === query) return;
    setQuery(next);
    onChangeText?.(next);
  };
  const clear = () => {
    if (disabled || !canClear) return;
    requestRestore((n) => n + 1);
    change('');
  };
  const editor = {
    ...textInput,
    ref: focusTargetRef,
    onFocus,
    onBlur,
    returnKeyType: 'search' as const,
    submitBehavior: 'submit' as const,
    onSubmitEditing: onSubmitQuery
      ? ({ nativeEvent }: TextInputSubmitEditingEvent) => {
          if (!disabled) onSubmitQuery(typeof nativeEvent.text === 'string' ? nativeEvent.text : query);
        }
      : undefined,
    // AppKit filters handled key equivalents only outside a marked-text composition.
    keyDownEvents: Platform.OS === 'macos' && !disabled && canClear ? [{ key: 'Escape' }] : undefined,
    onKeyDown:
      Platform.OS === 'macos'
        ? (event: FocusKeyboardEvent) => {
            const { key, code, altKey, ctrlKey, metaKey, shiftKey } = event.nativeEvent;
            if (
              disabled ||
              !canClear ||
              event.defaultPrevented ||
              altKey ||
              ctrlKey ||
              metaKey ||
              shiftKey ||
              (key !== 'Escape' && code !== 'Escape')
            )
              return;
            event.preventDefault?.();
            event.stopPropagation?.();
            clear();
          }
        : undefined,
  };
  useAccessibilityLabelWarning({
    componentName: 'SearchBox',
    accessibilityLabel: accessibilityLabel.trim() ? accessibilityLabel : undefined,
    accessibilityLabelledBy: textInput?.accessibilityLabelledBy,
    requireLabel: true,
    warning: 'SearchBox: name the search editor independently of its placeholder.',
  });
  useAccessibilityLabelWarning({
    componentName: 'SearchBox',
    accessibilityLabel: clearLabel.trim() ? clearLabel : undefined,
    requireLabel: true,
    warning: 'SearchBox: name the clear action with a localized clearLabel.',
  });

  return {
    ...useThemeState(),
    size,
    visualState: disabled ? 'disabled' : 'rest',
    userStyle,
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false }),
    input: {
      value: query,
      onChangeText: change,
      accessibilityLabel,
      disabled,
      size,
      variant,
      placeholder,
      textInput: editor,
    },
    clear: useOptionalSlot(
      Button,
      canClear
        ? {
            ...commandPressProps(clear, disabled),
            disabled,
            accessibilityLabel: clearLabel,
            leadingIcon: { fontSource: semanticIconSources.dismiss },
          }
        : null,
    ),
  };
}
