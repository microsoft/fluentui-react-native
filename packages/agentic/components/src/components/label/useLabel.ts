import { View } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { Text } from '../text/text';
import type { LabelProps, LabelState } from './label.types';

/**
 * The root owns the accessible name, so both text slots stay out of the accessibility tree. That keeps the label a
 * single element and stops the required indicator from being announced as punctuation.
 */
const defaultContentProps = {
  ...hiddenFromAccessibilityProps,
  children: 'Label',
} as const;

const defaultRequiredIndicatorProps = {
  ...hiddenFromAccessibilityProps,
  children: '*',
} as const;

/**
 * Reads the label string out of the content slot so the root can expose it as the accessible name. Content that is
 * not a string has no readable name, so the caller supplies one instead.
 */
function getContentText(contentProp: LabelProps['content']): string | undefined {
  if (contentProp === undefined) {
    return defaultContentProps.children;
  }
  if (typeof contentProp === 'string') {
    return contentProp;
  }
  if (typeof contentProp === 'number') {
    return String(contentProp);
  }
  if (typeof contentProp === 'object' && contentProp !== null && 'children' in contentProp) {
    const { children } = contentProp as { children?: unknown };
    if (typeof children === 'string') {
      return children;
    }
    if (typeof children === 'number') {
      return String(children);
    }
  }
  return undefined;
}

/**
 * Creates the resolved state for Label.
 */
export function useLabel_unstable(props: LabelProps): LabelState {
  const {
    accessibilityLabel,
    content: contentProp,
    disabled: disabledProp,
    required: requiredProp,
    requiredIndicator: requiredIndicatorProp,
    size: sizeProp,
    style: userStyle,
    weight: weightProp,
    ...rest
  } = props;

  const disabled = disabledProp ?? false;
  const required = requiredProp ?? false;
  const size = sizeProp ?? 'medium';
  const weight = weightProp ?? 'regular';
  const contentText = getContentText(contentProp);
  const resolvedAccessibilityLabel = accessibilityLabel ?? contentText;

  useAccessibilityLabelWarning({
    accessibilityLabel: resolvedAccessibilityLabel ?? rest['aria-label'],
    accessibilityLabelledBy: rest.accessibilityLabelledBy ?? rest['aria-labelledby'],
    componentName: 'Label',
    requireLabel: contentText === undefined,
    warning: 'Label: content that is not a string requires an accessibilityLabel.',
  });

  const themeState = useThemeState();
  const root = useSlot(View, {
    ...rest,
    accessibilityLabel: resolvedAccessibilityLabel,
    accessible: rest.accessible ?? true,
    focusable: false,
  });
  // Slots keep default props by identity, and React freezes them once rendered, so each render gets its own copy.
  const content = useSlot(Text, contentProp, {
    defaultProps: { ...defaultContentProps },
    transform: (slotProps) => ({ ...slotProps, ...hiddenFromAccessibilityProps }),
  });
  const requiredIndicator = useOptionalSlot(Text, required ? requiredIndicatorProp : null, {
    defaultProps: { ...defaultRequiredIndicatorProps },
    renderByDefault: true,
    transform: (slotProps) => ({ ...slotProps, ...hiddenFromAccessibilityProps }),
  });

  return {
    root,
    content,
    requiredIndicator,
    disabled,
    required,
    size,
    weight,
    userStyle,
    ...themeState,
  };
}
