import { View } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';

import { Icon } from '../../primitives/icon/icon';
import { Text } from '../text/text';
import { getBadgeStatusIcon } from './badge.styles';
import type { BadgeProps, BadgeState } from './badge.types';

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
    count,
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
  const isNotification = layout === 'counter' || layout === 'dot';
  const appearance = isNotification ? 'filled' : appearanceProp === 'outline' ? 'outline' : 'tint';
  const color = colorProp ?? 'informative';
  const size = sizeProp ?? 'medium';
  const shape = layout === 'dot' ? 'circular' : (shapeProp ?? 'circular');
  const iconOnly = layout === 'iconOnly';
  const leadingIconVisible = iconOnly || (layout === 'iconAndText' && (leadingIconVisibleProp ?? true));
  const trailingIconVisible = layout === 'iconAndText' && (trailingIconVisibleProp ?? false);
  const isInformative =
    !isNotification &&
    (accessibilityLabel !== undefined ||
      rest.accessibilityLabelledBy !== undefined ||
      rest['aria-label'] !== undefined ||
      rest['aria-labelledby'] !== undefined);
  const isAccessible = !isNotification && (accessible ?? isInformative);

  useAccessibilityLabelWarning({
    accessibilityLabel: accessibilityLabel ?? rest['aria-label'],
    accessibilityLabelledBy: rest.accessibilityLabelledBy ?? rest['aria-labelledby'],
    componentName: 'Badge',
    requireLabel: iconOnly,
    warning: 'Badge: icon-only badges require an accessibilityLabel.',
  });

  const themeState = useThemeState();
  const root = useSlot(View, {
    ...rest,
    accessible: isAccessible,
    accessibilityElementsHidden: isAccessible ? accessibilityElementsHidden : true,
    accessibilityLabel,
    accessibilityRole: isInformative ? 'image' : undefined,
    role: isInformative ? 'img' : undefined,
    importantForAccessibility: isAccessible ? importantForAccessibility : 'no-hide-descendants',
    focusable: false,
  });
  const content = useOptionalSlot(Text, layout === 'counter' ? (count ?? null) : layout === 'iconAndText' ? contentProp : null, {
    defaultProps: { children: 'Badge' },
    renderByDefault: true,
  });
  const variant = { appearance, color, size, shape, layout } as const;
  const replacement = leadingIconProp && typeof leadingIconProp === 'object' && 'as' in leadingIconProp && leadingIconProp.as;
  const defaultSource = leadingIconVisible && !replacement ? getBadgeStatusIcon(themeState, variant) : undefined;
  const leadingIcon = useOptionalSlot(Icon, leadingIconVisible ? leadingIconProp : null, {
    renderByDefault: true,
    transform: (slot) =>
      defaultSource && !slot.fontSource && !slot.imageSource && !slot.svgSource ? { ...slot, svgSource: defaultSource } : slot,
  });
  const trailingIcon = useOptionalSlot(Icon, trailingIconVisible ? trailingIconProp : null);

  return {
    root,
    content,
    leadingIcon,
    trailingIcon,
    ...themeState,
    ...variant,
    iconOnly,
    leadingIconVisible,
    trailingIconVisible,
    hasContent: !!content,
    hasLeadingIcon: !!leadingIcon,
    hasTrailingIcon: !!trailingIcon,
    userStyle,
    themeState,
  };
}
