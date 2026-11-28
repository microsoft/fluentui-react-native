import { useState } from 'react';
import { I18nManager, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useControllableValue, useSlot } from '@fluentui-react-native/framework-base';
import { desktopControls } from '../../common/desktopControls';
import { createNumericScale } from '../../common/numericScale';
import type { RatingProps, RatingState } from './rating.types';

export function useRating_unstable({
  accessibilityLabel,
  formatValue,
  disabled = false,
  size = 'medium',
  step = 0.5,
  max = 5,
  defaultValue = null,
  value,
  onValueChange,
  targetTestID,
  style: userStyle,
  ...rootProps
}: RatingProps): RatingState {
  if (!desktopControls?.RangeTarget) throw new Error('Rating requires a native writable range target.');
  if (!Number.isSafeInteger(max) || max <= 0 || max > 100 || (step !== 0.5 && step !== 1)) {
    throw new TypeError('Rating requires 1–100 whole stars and a step of 0.5 or 1.');
  }
  const scale = createNumericScale(0, max, step);
  const [unresolved, setValue] = useControllableValue<number | null>(value, defaultValue);
  const committed = unresolved == null ? null : scale.resolve(unresolved);
  const [width, setWidth] = useState(0);
  const [preview, setPreview] = useState<number>();
  const inactive = disabled || !accessibilityLabel.trim();
  const rtl = I18nManager.isRTL;
  const score = (inline: number) => {
    if (width <= 0 || !Number.isFinite(inline)) return undefined;
    const fraction = Math.min(1, Math.max(0, rtl ? 1 - inline / width : inline / width));
    return scale.resolve(Math.ceil((fraction * max) / step) * step);
  };
  const change = (next: number | null) => {
    if (inactive || next === committed) return;
    setValue(next);
    onValueChange?.(next);
  };
  useAccessibilityLabelWarning({
    componentName: 'Rating',
    accessibilityLabel: accessibilityLabel.trim() ? accessibilityLabel : undefined,
    requireLabel: true,
    warning: 'Rating: provide a localized accessible name.',
  });
  const rendered = (inactive ? committed : (preview ?? committed)) ?? 0;
  return {
    ...useThemeState(),
    size,
    disabled: inactive,
    userStyle,
    stars: Array.from({ length: max }, (_, index) => (rendered >= index + 1 ? 'full' : rendered > index ? 'half' : 'empty')),
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false }),
    input: useSlot(View, {
      collapsable: false,
      onLayout: ({ nativeEvent }) => setWidth(nativeEvent.layout.width),
      onPointerMove: ({ nativeEvent }) => {
        if (!inactive && nativeEvent.pointerType === 'mouse') setPreview(score(nativeEvent.offsetX));
      },
      onPointerLeave: () => setPreview(undefined),
      onStartShouldSetResponder: () => !inactive && width > 0,
      onResponderRelease: ({ nativeEvent }) => {
        const next = score(nativeEvent.locationX);
        if (next !== undefined && nativeEvent.locationX >= 0 && nativeEvent.locationX <= width) change(next);
      },
    }),
    target: useSlot(desktopControls.RangeTarget, {
      targetLabel: accessibilityLabel,
      targetTestID,
      testID: targetTestID,
      minimum: 0,
      maximum: max,
      step,
      value: committed ?? 0,
      hasValue: committed !== null,
      valueDescription: formatValue(committed, max),
      horizontalReversed: rtl,
      disabled: inactive,
      clearable: true,
      pointerEvents: 'none',
      onValueRequest: ({ nativeEvent }) => {
        if (nativeEvent.kind === 'clear') change(null);
        else if (Number.isFinite(nativeEvent.value)) change(scale.resolve(nativeEvent.value));
      },
    }),
  };
}
