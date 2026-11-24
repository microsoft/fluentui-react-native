import { useEffect, useId, useRef } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { Icon } from '../../primitives/icon/icon';
import { Label } from '../label/label';
import { Text } from '../text/text';
import type { FieldBinding, FieldProps, FieldState } from './field.types';
import { FieldInfoLabel } from './fieldInfoLabel';

export function useField_unstable({
  label,
  renderControl,
  target,
  size = 'medium',
  orientation = 'vertical',
  labelProps,
  info,
  helperText,
  validationMessage,
  status = 'rest',
  required = false,
  style: userStyle,
  ...rootProps
}: FieldProps): FieldState {
  const id = useId();
  const labelID = `furn-field-${id}-label`;
  const helperID = helperText?.trim() ? `furn-field-${id}-helper` : undefined;
  const feedback = status !== 'rest' && status !== 'disabled' && validationMessage?.trim() ? validationMessage : undefined;
  const feedbackID = feedback ? `furn-field-${id}-feedback` : undefined;
  const disabled = status === 'disabled';
  const invalid = status === 'error';
  const descriptionIDs = [...(helperID ? [helperID] : []), ...(feedbackID ? [feedbackID] : [])];
  const binding: FieldBinding = { label, labelID, descriptionIDs, size, required, disabled, invalid };
  const labelInput = { content: label, labelID, target: disabled ? undefined : target, size, weight: labelProps?.weight, required };

  useAccessibilityLabelWarning({
    componentName: 'Field',
    accessibilityLabel: label.trim() ? label : undefined,
    requireLabel: true,
    warning: 'Field: provide a nonblank localized label.',
  });
  useEffect(() => {
    if (__DEV__ && invalid && !feedback) console.warn('Field: provide a validation message for an error.');
  }, [invalid, feedback]);
  const lastAnnouncement = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (status === 'disabled') return;
    const identity = feedback ? JSON.stringify([status, feedback]) : undefined;
    if (lastAnnouncement.current === identity) return;
    lastAnnouncement.current = identity;
    if (!feedback) return;
    if (Platform.OS === 'macos' && typeof AccessibilityInfo.announceForAccessibilityWithOptions === 'function') {
      AccessibilityInfo.announceForAccessibilityWithOptions(feedback, { queue: true });
    } else {
      AccessibilityInfo.announceForAccessibility?.(feedback);
    }
  }, [status, feedback]);

  return {
    ...useThemeState(),
    size,
    orientation,
    status,
    userStyle,
    binding,
    renderControl,
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false }),
    label: useOptionalSlot(Label, info ? null : labelInput),
    infoLabel: useOptionalSlot(FieldInfoLabel, info ? { ...labelInput, help: info, disabled } : null),
    controlColumn: useSlot(View, {}),
    messageStack: useOptionalSlot(View, helperID || feedbackID ? {} : null),
    helper: useOptionalSlot(
      View,
      helperID
        ? { nativeID: helperID, accessible: true, accessibilityRole: 'text', accessibilityLabel: helperText, focusable: false }
        : null,
    ),
    helperLabel: useOptionalSlot(Text, helperID ? { ...hiddenFromAccessibilityProps, children: helperText } : null),
    validationRow: useOptionalSlot(View, feedbackID ? {} : null),
    validationText: useOptionalSlot(
      View,
      feedbackID
        ? { nativeID: feedbackID, accessible: true, accessibilityRole: 'text', accessibilityLabel: feedback, focusable: false }
        : null,
    ),
    validationLabel: useOptionalSlot(Text, feedbackID ? { ...hiddenFromAccessibilityProps, children: feedback } : null),
    validationIcon: useOptionalSlot(Icon, feedbackID ? hiddenFromAccessibilityProps : null),
  };
}
