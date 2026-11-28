import { View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useControllableValue, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { Label } from '../label/label';
import { Popover } from '../popover/popover';
import { Text } from '../text/text';
import type { InfoLabelProps, InfoLabelState } from './info-label.types';

export function useInfoLabel_unstable(props: InfoLabelProps): InfoLabelState {
  return useInfoLabel(props, props.disabled);
}

export function useInfoLabel(
  { content, labelID, target, size = 'medium', weight, required, disabled = false, help, style: userStyle, ...rootProps }: InfoLabelProps,
  muteLabel = false,
): InfoLabelState {
  const { triggerLabel, surfaceLabel, children, open, defaultOpen = false, onOpenChange } = help;
  const resolvedSurfaceLabel = surfaceLabel?.trim() ? surfaceLabel : triggerLabel;
  const [requestedOpen = false, setRequestedOpen] = useControllableValue(open, defaultOpen);
  const triggerProps = { accessibilityLabel: triggerLabel, disabled };
  const helpText = typeof children === 'string' || typeof children === 'number';
  const valid =
    !!triggerLabel.trim() && children != null && typeof children !== 'boolean' && (typeof children !== 'string' || !!children.trim());
  useAccessibilityLabelWarning({
    componentName: 'InfoLabel',
    accessibilityLabel: valid ? triggerLabel : undefined,
    requireLabel: true,
    warning: 'InfoLabel: provide a localized help trigger name and help content, or use Label.',
  });
  return {
    ...useThemeState(),
    size,
    userStyle,
    helpContent: children,
    surfaceLabel: resolvedSurfaceLabel,
    triggerProps,
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false }),
    label: useSlot(Label, { content, labelID, target: disabled ? undefined : target, size, weight, required, disabled: muteLabel }),
    helpText: useOptionalSlot(Text, helpText ? { children } : null),
    help: useOptionalSlot(
      Popover,
      valid
        ? {
            children: null,
            placement: 'top',
            surface: { accessibilityLabel: resolvedSurfaceLabel },
            trigger: triggerProps,
            open: !disabled && requestedOpen,
            onOpenChange: (next, data) => {
              if (!disabled) {
                setRequestedOpen(next);
                onOpenChange?.(next, data);
              }
            },
          }
        : null,
    ),
  };
}
