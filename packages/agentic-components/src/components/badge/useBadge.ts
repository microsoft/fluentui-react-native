import * as React from 'react';
import { Text, View } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';

import { Icon } from '../../primitives/icon/icon';
import type { BadgeProps, BadgeState } from './badge.types';

const defaultBadgeIcon = {
  fontSource: { codepoint: 0x25cf, fontFamily: 'Arial' },
} as const;

/**
 * Creates the resolved state for Badge.
 */
export function useBadge_unstable(props: BadgeProps): BadgeState {
  const {
    accessibilityElementsHidden,
    accessibilityLabel,
    accessible,
    appearance: appearanceProp,
    color: colorProp,
    content: contentProp,
    leadingIcon: leadingIconProp,
    leadingIconVisible: leadingIconVisibleProp,
    layout: layoutProp,
    importantForAccessibility,
    shape: shapeProp,
    size: sizeProp,
    style: userStyle,
    trailingIcon: trailingIconProp,
    trailingIconVisible: trailingIconVisibleProp,
    ...rest
  } = props;

  const layout = layoutProp ?? 'iconAndText';
  const appearance = appearanceProp ?? 'tint';
  const color = colorProp ?? 'brand';
  const size = sizeProp ?? 'medium';
  const shape = shapeProp ?? 'circular';
  const iconOnly = layout === 'iconOnly';
  const leadingIconVisible = iconOnly ? true : leadingIconVisibleProp ?? true;
  const trailingIconVisible = iconOnly ? false : trailingIconVisibleProp ?? false;
  const hasContent = !iconOnly && contentProp !== null;
  const hasLeadingIcon = leadingIconProp !== undefined && leadingIconProp !== null;
  const hasTrailingIcon = trailingIconProp !== undefined && trailingIconProp !== null;
  const isInformative = accessibilityLabel !== undefined;
  const isAccessible = accessible ?? isInformative;

  React.useEffect(() => {
    if (__DEV__ && iconOnly && !accessibilityLabel) {
      console.warn('Badge: icon-only badges require an accessibilityLabel.');
    }
  }, [accessibilityLabel, iconOnly]);

  const themeState = useThemeState();
  const root = useSlot(View, {
    ...rest,
    accessible: isAccessible,
    accessibilityElementsHidden: isAccessible ? accessibilityElementsHidden : true,
    accessibilityLabel,
    accessibilityRole: isInformative ? 'image' : undefined,
    importantForAccessibility: isAccessible ? importantForAccessibility : 'no-hide-descendants',
    focusable: false,
  });
  const content = useOptionalSlot(Text, iconOnly ? null : contentProp === null ? null : contentProp, {
    defaultProps: { children: 'Badge' },
    renderByDefault: true,
  });
  const leadingIcon = useOptionalSlot(Icon, leadingIconVisible ? leadingIconProp : null, {
    defaultProps: defaultBadgeIcon,
    renderByDefault: true,
  });
  const trailingIcon = useOptionalSlot(Icon, trailingIconVisible ? trailingIconProp : null);

  return {
    root,
    content,
    leadingIcon,
    trailingIcon,
    appearance,
    color,
    size,
    shape,
    layout,
    iconOnly,
    leadingIconVisible,
    trailingIconVisible,
    hasContent,
    hasLeadingIcon,
    hasTrailingIcon,
    userStyle,
    ...themeState,
  };
}
