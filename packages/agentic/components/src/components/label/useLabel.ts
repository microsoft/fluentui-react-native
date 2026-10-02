import { isValidElement } from 'react';
import { View } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import type { ExtractSlotProps } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { Text } from '../text/text';
import type { LabelProps, LabelState } from './label.types';

function isTextSlotProps(value: LabelProps['content']): value is ExtractSlotProps<LabelProps['content']> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !isValidElement(value) &&
    !(Symbol.iterator in value) &&
    !('$$typeof' in value && value.$$typeof === Symbol.for('react.portal'))
  );
}

function getContentText(content: LabelProps['content']): string | undefined {
  if (content === undefined) {
    return 'Label';
  }
  const children = isTextSlotProps(content) ? content.children : content;
  return typeof children === 'string' || typeof children === 'number' ? String(children) : undefined;
}

export function useLabel_unstable(props: LabelProps): LabelState {
  const {
    accessibilityLabel,
    'aria-label': ariaLabel,
    accessible = true,
    content: contentProp,
    disabled = false,
    ref,
    required = false,
    requiredIndicator: indicatorProp,
    size = 'medium',
    style: userStyle,
    weight = 'regular',
    ...rest
  } = props;
  const resolvedName = accessibilityLabel ?? ariaLabel ?? getContentText(contentProp);
  useAccessibilityLabelWarning({
    accessibilityLabel: resolvedName?.trim(),
    componentName: 'Label',
    requireLabel: accessible,
    warning: 'Label: accessible content requires a non-empty accessibilityLabel or scalar content.',
  });

  const contentProps = isTextSlotProps(contentProp) ? contentProp : undefined;
  const indicatorProps = isTextSlotProps(indicatorProp) ? indicatorProp : undefined;
  const themeState = useThemeState();
  const root = useSlot(
    View,
    {
      ...rest,
      accessibilityLabel: resolvedName,
      accessible,
      ref,
    },
    {
      transform: (slotProps) => ({
        ...slotProps,
        accessibilityRole: 'text',
        role: undefined,
        focusable: false,
        tabIndex: -1,
        'aria-label': undefined,
      }),
    },
  );
  // Keep caller styles out of the early Text phase; the styling stage places them last.
  const content = useSlot(Text, contentProps ? { ...contentProps, style: undefined } : contentProp, {
    defaultProps: { children: 'Label', ...hiddenFromAccessibilityProps },
    transform: (slotProps) => ({ ...slotProps, ...hiddenFromAccessibilityProps }),
  });
  const requiredIndicator = useOptionalSlot(
    Text,
    required ? (indicatorProps ? { ...indicatorProps, style: undefined } : indicatorProp) : null,
    {
      defaultProps: { children: '*', ...hiddenFromAccessibilityProps },
      renderByDefault: true,
      transform: (slotProps) => ({ ...slotProps, ...hiddenFromAccessibilityProps }),
    },
  );

  return {
    root,
    content,
    requiredIndicator,
    disabled,
    required,
    size,
    weight,
    userStyle,
    userContentStyle: contentProps?.style,
    userRequiredIndicatorStyle: indicatorProps?.style,
    ...themeState,
  };
}
