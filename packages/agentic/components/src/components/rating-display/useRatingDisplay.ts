import { View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import type { RatingItemFill } from '../rating-item/rating-item.types';
import { Text } from '../text/text';
import type { RatingDisplayProps, RatingDisplayState } from './rating-display.types';

const MAX_VISUAL_STARS = 100;
let numberFormatter: Intl.NumberFormat | undefined;

function formatDeviceNumber(value: number): string {
  if (typeof Intl === 'undefined' || typeof Intl.NumberFormat !== 'function') return String(value);
  return (numberFormatter ??= new Intl.NumberFormat(undefined, { maximumSignificantDigits: 21 })).format(value);
}

function ratingFills(value: number, max: number, compact: boolean): RatingItemFill[] {
  if (compact || max > MAX_VISUAL_STARS) return ['full'];
  const halves = Math.round(value * 2);
  return Array.from({ length: max }, (_, index) => (halves >= index * 2 + 2 ? 'full' : halves > index * 2 ? 'half' : 'empty'));
}

export function useRatingDisplay_unstable({
  value: rawValue,
  max = 5,
  count: rawCount,
  layout = 'default',
  size = 'medium',
  decorative,
  formatSummary,
  formatNumber = formatDeviceNumber,
  style: userStyle,
  ...rootProps
}: RatingDisplayProps): RatingDisplayState {
  const value = rawValue + 0;
  const count = rawCount !== undefined && Number.isSafeInteger(rawCount) && rawCount >= 0 ? rawCount + 0 : undefined;
  const validScore = Number.isFinite(value) && Number.isSafeInteger(max) && max >= 1 && value >= 0 && value <= max;
  const fills = validScore ? ratingFills(value, max, layout === 'compact') : [];
  return {
    ...useThemeState(),
    size,
    fills,
    userStyle,
    root: useSlot(View, {
      ...rootProps,
      ...(decorative || !validScore
        ? hiddenFromAccessibilityProps
        : { accessible: true, accessibilityRole: 'image', role: 'img', accessibilityLabel: formatSummary?.(value, max, count) }),
      focusable: false,
    }),
    stars: useOptionalSlot(View, fills.length ? hiddenFromAccessibilityProps : null),
    value: useOptionalSlot(Text, validScore ? { ...hiddenFromAccessibilityProps, children: formatNumber(value) } : null),
    count: useOptionalSlot(
      Text,
      !validScore || count === undefined ? null : { ...hiddenFromAccessibilityProps, children: `(${formatNumber(count)})` },
    ),
  };
}
