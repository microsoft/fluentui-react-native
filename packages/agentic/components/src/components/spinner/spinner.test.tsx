/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, type View, processColor } from 'react-native';
import type { ColorValue, ViewStyle } from 'react-native';

import { act, waitFor } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Spinner } from './spinner';

const reduceMotionSubscription = { remove: jest.fn() };

// Keep Jest's overload inference on the boolean motion event rather than announcementFinished.
const motionEvents: {
  addEventListener(
    event: 'reduceMotionChanged',
    handler: (enabled: boolean) => void,
  ): ReturnType<typeof AccessibilityInfo.addEventListener>;
} = AccessibilityInfo;

function renderSpinner(props: React.ComponentProps<typeof Spinner>) {
  return render(<Spinner {...props} />);
}

function getRoot(component: Awaited<ReturnType<typeof renderSpinner>>) {
  return component.getByRole('progressbar');
}

function getRootStyle(component: Awaited<ReturnType<typeof renderSpinner>>): ViewStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

function getSvg(component: Awaited<ReturnType<typeof renderSpinner>>) {
  const svg = getRoot(component).children[0];
  if (typeof svg === 'string') {
    throw new TypeError('Spinner root must render an SVG element.');
  }
  return svg;
}

function getTrack(component: Awaited<ReturnType<typeof renderSpinner>>) {
  return component.getByTestId('spinner-track');
}

function getIndicator(component: Awaited<ReturnType<typeof renderSpinner>>) {
  return component.getByTestId('spinner-indicator');
}

function normalizeColor(value: ColorValue) {
  return { payload: processColor(value), type: 0 };
}

describe('Spinner', () => {
  it('SPIN-006 stays static while the motion preference is pending and stops and resets when it changes', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockReturnValue(new Promise(() => undefined));
    const animation = { start: jest.fn(), stop: jest.fn(), reset: jest.fn() };
    const loop = jest.spyOn(Animated, 'loop').mockReturnValue(animation);
    const resetValue = jest.spyOn(Animated.Value.prototype, 'setValue');
    const component = await renderSpinner({ accessibilityLabel: 'Loading messages' });
    expect(loop).not.toHaveBeenCalled();
    expect(StyleSheet.flatten(getSvg(component).props.style).transform).toBeUndefined();
    const listener = jest.mocked(motionEvents.addEventListener).mock.calls.find(([event]) => event === 'reduceMotionChanged')?.[1];
    if (!listener) throw new Error('Spinner must subscribe to the native reduced-motion setting.');
    await act(async () => listener(false));
    expect(animation.start).toHaveBeenCalledTimes(1);
    expect(StyleSheet.flatten(getSvg(component).props.style).transform).toBeDefined();
    await act(async () => listener(true));
    expect(animation.stop).toHaveBeenCalledTimes(1);
    expect(resetValue).toHaveBeenLastCalledWith(0);
    expect(StyleSheet.flatten(getSvg(component).props.style).transform).toBeUndefined();
    expect(getRoot(component).props.accessibilityState.busy).toBe(true);
    await component.unmount();
    expect(reduceMotionSubscription.remove).toHaveBeenCalled();
  });

  it('SPIN-002 SPIN-004 preserves caller root props and styles but owns busy state', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const ref = React.createRef<React.ComponentRef<typeof View>>();
    const component = await renderSpinner({
      ref,
      accessibilityLabel: 'Loading messages',
      accessibilityState: { busy: false, selected: true },
      pointerEvents: 'box-only',
      style: { width: 80, backgroundColor: 'purple' },
    });
    expect(ref.current).not.toBeNull();
    expect(getRoot(component).props).toMatchObject({
      accessibilityState: { busy: true, selected: true },
      pointerEvents: 'box-only',
      focusable: false,
    });
    expect(getRootStyle(component)).toMatchObject({ width: 80, height: 32, backgroundColor: 'purple' });
    expect(getSvg(component).props.accessible).toBe(false);
  });

  it('SPIN-005 suppresses missing-name warnings only when the root is explicitly decorative', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const component = await renderSpinner({ accessible: false, testID: 'decorative-spinner' });
    expect(component.queryByRole('progressbar')).toBeNull();
    expect(warn).not.toHaveBeenCalled();
    expect(component.getByTestId('decorative-spinner').props.accessible).toBe(false);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(motionEvents, 'addEventListener').mockReturnValue(reduceMotionSubscription as never);
  });

  afterEach(() => {
    reduceMotionSubscription.remove.mockClear();
  });

  it('renders as an accessible progressbar with default medium sizing', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const component = await renderSpinner({ accessibilityLabel: 'Loading messages' });
    const root = getRoot(component);
    const svg = getSvg(component);
    const track = getTrack(component);
    const indicator = getIndicator(component);
    const tokens = defaultFlexTokens;

    expect(root.props.accessibilityRole).toBe('progressbar');
    expect(root.props.accessibilityState).toEqual({ busy: true });
    expect(root.props.focusable).toBe(false);
    expect(root.props.pointerEvents).toBe('none');
    expect(getRootStyle(component)).toMatchObject({ height: 32, width: 32 });
    expect(svg.props.width).toBe(32);
    expect(svg.props.height).toBe(32);
    expect(track.props.stroke).toEqual(normalizeColor(tokens.color.strokeNeutralSubtle.rest));
    expect(track.props.strokeWidth).toBe(tokens.strokeWidth.thick);
    expect(indicator.props.stroke).toEqual(normalizeColor(tokens.color.strokeNeutralLoud.rest));
    const circumference = 2 * Math.PI * ((32 - Number(tokens.strokeWidth.thick)) / 2);
    expect(indicator.props.strokeDasharray).toEqual([circumference / 4, (circumference * 3) / 4]);
    expect(indicator.props).not.toHaveProperty('pathLength');
    expect(indicator.props.strokeWidth).toBe(tokens.strokeWidth.thick);
  });

  it.each([
    ['x-tiny', 16, 'thin'],
    ['tiny', 20, 'thin'],
    ['x-small', 24, 'thin'],
    ['small', 28, 'thick'],
    ['medium', 32, 'thick'],
    ['large', 36, 'thicker'],
    ['x-large', 40, 'thicker'],
    ['huge', 44, 'thicker'],
  ] as const)('resolves the %s size', async (size, diameter, strokeWidthToken) => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const component = await renderSpinner({ accessibilityLabel: size, size });
    const tokens = defaultFlexTokens;
    const track = getTrack(component);
    const indicator = getIndicator(component);

    expect(getRootStyle(component)).toMatchObject({ height: diameter, width: diameter });
    expect(getSvg(component).props.width).toBe(diameter);
    expect(getSvg(component).props.height).toBe(diameter);
    expect(track.props.strokeWidth).toBe(tokens.strokeWidth[strokeWidthToken]);
    expect(indicator.props.strokeWidth).toBe(tokens.strokeWidth[strokeWidthToken]);
    const circumference = Math.PI * (diameter - Number(tokens.strokeWidth[strokeWidthToken]));
    expect(indicator.props.strokeDasharray[0]).toBeCloseTo(circumference / 4);
    expect(indicator.props.strokeDasharray[1]).toBeCloseTo((circumference * 3) / 4);
  });

  it('warns when no accessible name is supplied', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const warn = jest.spyOn(console, 'warn').mockImplementation();

    await renderSpinner({});

    expect(warn).toHaveBeenCalledWith(
      'Spinner: accessibilityLabel or accessibilityLabelledBy is required when the spinner is exposed directly.',
    );
    warn.mockRestore();
  });

  it('shares continuous rotation through the macOS Fabric driver when reduce motion is disabled', async () => {
    const loop = jest.spyOn(Animated, 'loop').mockReturnValue({ start: jest.fn(), stop: jest.fn() } as never);
    const timing = jest.spyOn(Animated, 'timing').mockReturnValue({ start: jest.fn(), stop: jest.fn() } as never);
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);

    await renderSpinner({ accessibilityLabel: 'Loading messages' });
    await renderSpinner({ accessibilityLabel: 'Loading contacts' });

    await waitFor(() => expect(loop).toHaveBeenCalled());
    expect(loop).toHaveBeenCalledTimes(1);
    expect(timing).toHaveBeenCalledTimes(1);
    expect(timing).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        duration: 1500,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: false,
      }),
    );
  });

  it('preserves consumer accessibility label-by references', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const component = await renderSpinner({ accessibilityLabelledBy: 'spinner-label' });

    expect(getRoot(component).props.accessibilityLabelledBy).toBe('spinner-label');
  });
});
