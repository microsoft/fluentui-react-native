import * as React from 'react';
import { View } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { Text } from '../text/text';
import type { AvatarGroupProps, AvatarGroupState } from './avatar-group.types';

/** The number of rendered items past which the group stops reading as a scannable cohort. */
const maximumRenderedItems = 5;

/** The largest count the indicator can show before the exact total has to move into the accessible name. */
const maximumOverflowCount = 99;

function normalizeOverflowCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function formatOverflowCount(count: number): string {
  return `+${Math.min(count, maximumOverflowCount)}`;
}

function flattenItems(children: React.ReactNode, keyPrefix = ''): { key: React.Key; node: React.ReactNode }[] {
  const items: { key: React.Key; node: React.ReactNode }[] = [];
  React.Children.forEach(children, (child, index) => {
    const childKey = React.isValidElement(child) && child.key !== null ? child.key : index;
    const key = keyPrefix ? `${keyPrefix}/${String(childKey)}` : childKey;
    if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment) {
      items.push(...flattenItems(child.props.children, String(key)));
    } else {
      items.push({ key, node: child });
    }
  });
  return items;
}

function hasAccessibleName(props: {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string;
}): boolean {
  return (
    props.accessibilityLabel !== undefined ||
    props.accessibilityLabelledBy !== undefined ||
    props['aria-label'] !== undefined ||
    props['aria-labelledby'] !== undefined
  );
}

export function useAvatarGroup_unstable(props: AvatarGroupProps): AvatarGroupState {
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityRole,
    accessible,
    children,
    layout = 'spread',
    overflow: overflowProp,
    overflowCount: overflowCountProp = 0,
    size = 40,
    style: userStyle,
    ...rest
  } = props;

  const overflowCount = normalizeOverflowCount(overflowCountProp);
  const isInformative = hasAccessibleName({
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    accessibilityLabel,
    accessibilityLabelledBy,
  });
  const isAccessible = accessible ?? isInformative;
  const hasOverflow = overflowCount > 0;
  const showOverflow = hasOverflow && size !== 16 && overflowProp !== null;
  const overflowLabel = showOverflow ? formatOverflowCount(overflowCount) : '';

  const { hasSizeMismatch, items } = React.useMemo(() => {
    let mismatch = false;
    const resolvedItems = flattenItems(children);
    for (const { node: item } of resolvedItems) {
      if (React.isValidElement<{ size?: unknown }>(item) && item.props.size !== undefined && item.props.size !== size) {
        mismatch = true;
      }
    }
    return { hasSizeMismatch: mismatch, items: resolvedItems };
  }, [children, size]);

  const renderedItems = items.length + (showOverflow ? 1 : 0);
  const suppressedOverflow = hasOverflow && size === 16;

  React.useEffect(() => {
    if (!__DEV__) {
      return;
    }
    if (hasSizeMismatch) {
      console.warn('AvatarGroup: every child avatar should use the same size as the group.');
    }
    if (suppressedOverflow) {
      console.warn('AvatarGroup: size 16 omits the overflow indicator, so expose the hidden count in accessibilityLabel.');
    }
    if (renderedItems > maximumRenderedItems) {
      console.warn(`AvatarGroup: render at most ${maximumRenderedItems} items and move the rest into overflowCount.`);
    }
  }, [hasSizeMismatch, renderedItems, suppressedOverflow]);

  const themeState = useThemeState();
  const root = useSlot(View, {
    ...rest,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    accessible: isAccessible,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityRole: accessibilityRole ?? (isAccessible ? 'image' : 'none'),
  });

  const overflow = useOptionalSlot(View, showOverflow ? (overflowProp ?? {}) : null, {
    transform: (slotProps) => {
      const isSelfLabeled = !isAccessible && hasAccessibleName(slotProps);
      return isSelfLabeled
        ? { ...slotProps, accessible: slotProps.accessible ?? true, accessibilityRole: slotProps.accessibilityRole ?? 'image' }
        : { ...slotProps, ...hiddenFromAccessibilityProps };
    },
  });

  const overflowText = useOptionalSlot(Text, showOverflow ? { children: overflowLabel } : null);

  return {
    root,
    overflow,
    overflowText,
    items,
    itemAccessibilityProps: isAccessible ? hiddenFromAccessibilityProps : undefined,
    layout,
    overflowCount,
    overflowLabel,
    size,
    userStyle,
    ...themeState,
  };
}
