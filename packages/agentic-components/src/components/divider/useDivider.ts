import { Text, View } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';

import { Icon } from '../../primitives/icon/icon';
import type { DividerProps, DividerState } from './divider.types';

function getTextFromSlotProp(slot: DividerProps['label']): string | undefined {
  if (typeof slot === 'string' || typeof slot === 'number') {
    return String(slot);
  }

  if (slot && typeof slot === 'object' && 'children' in slot) {
    const { children } = slot;
    if (typeof children === 'string' || typeof children === 'number') {
      return String(children);
    }
  }

  return undefined;
}

/**
 * Builds the Divider state, resolving accessibility, slots, and defaults.
 */
export function useDivider_unstable(props: DividerProps): DividerState {
  const { accessibilityLabel, icon: iconProp, label: labelProp, layout = 'center', style: userStyle, vertical = false, ...rest } = props;
  const hasIcon = iconProp !== undefined && iconProp !== null;
  const hasLabel = labelProp !== null;
  const contentVisible = hasIcon || hasLabel;
  const labelText = hasLabel ? (getTextFromSlotProp(labelProp) ?? 'Text') : undefined;
  const themeState = useThemeState();
  const root = useSlot(View, {
    ...rest,
    accessibilityLabel: accessibilityLabel ?? labelText,
    accessibilityRole: 'separator',
    accessible: rest.accessible ?? true,
    focusable: false,
  });
  const icon = useOptionalSlot(Icon, iconProp);
  const label = useOptionalSlot(Text, labelProp, {
    defaultProps: { children: 'Text' },
    renderByDefault: true,
  });
  const contentContainer = useOptionalSlot(View, contentVisible ? {} : null);

  return {
    root,
    icon,
    label,
    contentContainer,
    layout,
    vertical,
    hasIcon,
    hasLabel,
    contentVisible,
    labelText,
    userStyle,
    ...themeState,
  };
}
