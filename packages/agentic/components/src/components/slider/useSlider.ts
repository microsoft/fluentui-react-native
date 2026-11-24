import { useLayoutEffect, useRef, useState } from 'react';
import { I18nManager, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useControllableValue, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { desktopControls } from '../../common/desktopControls';
import { createNumericScale } from '../../common/numericScale';
import type { SliderProps, SliderSegment, SliderState, SliderThumb, SliderValue } from './slider.types';

const sameValue = (left: SliderValue, right: SliderValue) =>
  typeof left === 'number' || typeof right === 'number' ? left === right : left[0] === right[0] && left[1] === right[1];

export function useSlider_unstable(props: SliderProps): SliderState {
  if (!desktopControls) throw new Error('Slider requires a native writable range target. The current preview supports AppKit only.');
  const {
    mode,
    min = 0,
    max = 100,
    step = 1,
    orientation = 'horizontal',
    size = 'medium',
    disabled = false,
    marks = [],
    accessibilityLabel,
    formatValue,
    style: userStyle,
    value,
    defaultValue,
    onValueChange: _onValueChange,
    onValueCommit: _onValueCommit,
    thumbLabels,
    thumbTestID,
    thumbTestIDs,
    ...rootProps
  } = props;
  const scale = createNumericScale(min, max, step);
  const isRange = mode === 'range';
  const normalize = (raw?: SliderValue): SliderValue => {
    if (!isRange) return typeof raw === 'number' ? scale.resolve(raw) : scale.at(0.5);
    if (!Array.isArray(raw)) return [scale.at(0.25), scale.at(0.75)];
    const start = scale.resolve(raw[0]);
    const end = scale.resolve(raw[1]);
    return start <= end ? [start, end] : [end, start];
  };
  const [unresolved, setValue] = useControllableValue<SliderValue>(value, normalize(defaultValue));
  const resolved = normalize(unresolved);
  const pair: readonly [number, number] = typeof resolved === 'number' ? [min, resolved] : resolved;
  const [extent, setExtent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState<SliderThumb>(isRange ? 'lower' : 'single');
  const gesture = useRef<{ origin: number; before: SliderValue; preview: SliderValue; thumb: SliderThumb } | undefined>(undefined);
  const vertical = orientation === 'vertical';
  const reversed = !vertical && I18nManager.isRTL;
  const validNames =
    !!accessibilityLabel.trim() &&
    (mode !== 'range' || (thumbLabels.every((label) => !!label.trim()) && thumbLabels[0] !== thumbLabels[1]));
  const inactive = disabled || !validNames;
  const notify = (next: SliderValue, thumb: SliderThumb) => {
    setValue(next);
    if (mode === 'range' && typeof next !== 'number' && thumb !== 'single') props.onValueChange?.(next, { thumb });
    else if (mode !== 'range' && typeof next === 'number') props.onValueChange?.(next, { thumb: 'single' });
  };
  const commit = (next: SliderValue, thumb: SliderThumb) => {
    if (mode === 'range' && typeof next !== 'number' && thumb !== 'single') props.onValueCommit?.(next, { thumb });
    else if (mode !== 'range' && typeof next === 'number') props.onValueCommit?.(next, { thumb: 'single' });
  };
  const nextAt = (raw: number, thumb: SliderThumb, current: SliderValue): SliderValue => {
    const next = scale.resolve(raw);
    if (typeof current === 'number') return next;
    return thumb === 'upper' ? [current[0], Math.max(current[0], next)] : [Math.min(next, current[1]), current[1]];
  };
  const request = (raw: number, thumb: SliderThumb) => {
    if (inactive || !Number.isFinite(raw)) return;
    const next = nextAt(raw, thumb, resolved);
    setActive(thumb);
    if (sameValue(resolved, next)) return;
    notify(next, thumb);
    commit(next, thumb);
  };
  const cancel = () => {
    const drag = gesture.current;
    gesture.current = undefined;
    setDragging(false);
    if (drag && !sameValue(drag.before, drag.preview)) notify(drag.before, drag.thumb);
  };
  const latestCancel = useRef(cancel);
  latestCancel.current = cancel;
  useLayoutEffect(() => {
    if (gesture.current) latestCancel.current();
  }, [inactive, orientation, mode, min, max, step, reversed]);
  const valueAt = (coordinate: number) => scale.at(vertical || reversed ? 1 - coordinate / extent : coordinate / extent);
  const update = (coordinate: number) => {
    const drag = gesture.current;
    if (!drag || extent <= 0 || !Number.isFinite(coordinate) || inactive) return;
    const next = nextAt(valueAt(coordinate), drag.thumb, drag.preview);
    if (sameValue(drag.preview, next)) return;
    drag.preview = next;
    notify(next, drag.thumb);
  };
  const coordinate = (event: GestureResponderEvent, local: boolean) =>
    vertical
      ? local
        ? event.nativeEvent.locationY
        : event.nativeEvent.pageY
      : local
        ? event.nativeEvent.locationX
        : event.nativeEvent.pageX;
  const segment = (thumb: SliderThumb, label: string, testID?: string): SliderSegment => {
    const current = thumb === 'lower' ? pair[0] : pair[1];
    return {
      thumb,
      fraction: scale.fraction(current),
      active: active === thumb,
      native: {
        targetLabel: label,
        targetTestID: testID,
        testID,
        minimum: thumb === 'upper' ? pair[0] : min,
        maximum: thumb === 'lower' ? pair[1] : max,
        step,
        value: current,
        valueDescription: formatValue?.(current, thumb),
        disabled: inactive,
        horizontalReversed: reversed,
        onValueRequest: ({ nativeEvent }) => request(nativeEvent.value, thumb),
      },
    };
  };
  const segments =
    mode === 'range'
      ? [segment('lower', thumbLabels[0], thumbTestIDs?.[0]), segment('upper', thumbLabels[1], thumbTestIDs?.[1])]
      : [segment('single', accessibilityLabel, thumbTestID)];
  return {
    ...useThemeState(),
    orientation,
    size,
    userStyle,
    segments,
    Target: desktopControls.RangeTarget,
    visualState: inactive ? 'disabled' : dragging ? 'pressed' : 'rest',
    start: scale.fraction(pair[0]),
    end: scale.fraction(pair[1]),
    marks: [...new Set(marks.filter((mark) => Number.isFinite(mark) && mark >= min && mark <= max).map(scale.fraction))],
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false }),
    input: useSlot(View, {
      collapsable: false,
      onLayout: ({ nativeEvent }) => setExtent(vertical ? nativeEvent.layout.height : nativeEvent.layout.width),
      onStartShouldSetResponder: () => !inactive && extent > 0,
      onResponderGrant: (event) => {
        const point = coordinate(event, true);
        const raw = valueAt(point);
        const lower = Math.abs(raw - pair[0]);
        const upper = Math.abs(raw - pair[1]);
        const thumb = isRange ? (lower === upper ? (active === 'upper' ? 'upper' : 'lower') : lower < upper ? 'lower' : 'upper') : 'single';
        gesture.current = { origin: coordinate(event, false) - point, before: resolved, preview: resolved, thumb };
        setActive(thumb);
        setDragging(true);
        update(point);
      },
      onResponderMove: (event) => {
        const drag = gesture.current;
        if (drag) update(coordinate(event, false) - drag.origin);
      },
      onResponderRelease: () => {
        const drag = gesture.current;
        gesture.current = undefined;
        setDragging(false);
        if (drag && !sameValue(drag.before, drag.preview)) commit(drag.preview, drag.thumb);
      },
      onResponderTerminate: cancel,
    }),
    rail: useSlot(View, { ...hiddenFromAccessibilityProps, pointerEvents: 'none' }),
    track: useSlot(View, { ...hiddenFromAccessibilityProps, pointerEvents: 'none' }),
  };
}
