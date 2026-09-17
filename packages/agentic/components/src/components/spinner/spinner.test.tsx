/** @jsxImportSource @fluentui-react-native/framework-base */
import { AccessibilityInfo, Animated, Easing, StyleSheet, processColor } from 'react-native';
import type { ColorValue, ViewStyle } from 'react-native';

import { render, waitFor } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Spinner } from './spinner';

const reduceMotionSubscription = { remove: jest.fn() };

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
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue(reduceMotionSubscription as never);
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

    expect(root.props.role).toBe('progressbar');
    expect(root.props.accessibilityState).toEqual({ busy: true });
    expect(root.props.focusable).toBe(false);
    expect(root.props.pointerEvents).toBe('none');
    expect(getRootStyle(component)).toMatchObject({ height: 32, width: 32 });
    expect(svg.props.width).toBe(32);
    expect(svg.props.height).toBe(32);
    expect(track.props.stroke).toEqual(normalizeColor(tokens.color.strokeNeutralSubtle));
    expect(track.props.strokeWidth).toBe(tokens.strokeWidth.thick);
    expect(indicator.props.stroke).toEqual(normalizeColor(tokens.color.strokeNeutralLoud));
    expect(indicator.props.strokeDasharray).toEqual(['25', '75']);
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

  it('shares continuous rotation when reduce motion is disabled', async () => {
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
        useNativeDriver: true,
      }),
    );
  });

  it('preserves consumer accessibility label-by references', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const component = await renderSpinner({ accessibilityLabelledBy: 'spinner-label' });

    expect(getRoot(component).props.accessibilityLabelledBy).toBe('spinner-label');
  });
});
