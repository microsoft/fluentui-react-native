/** @jsxImportSource @fluentui-react-native/framework-base */
import { act } from 'react';
import { Animated, I18nManager, PlatformColor, StyleSheet, processColor } from 'react-native';
import type { ViewStyle } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { defaultFlexTokens, mockTheme } from '@fluentui-react-native/design/testing';
import { ThemeProvider, ThemeReference } from '@fluentui-react-native/design/theming';

import { useReducedMotion } from '@fluentui-react-native/framework-base';

import { Skeleton } from './skeleton';

jest.mock('@fluentui-react-native/framework-base', () => ({
  ...jest.requireActual('@fluentui-react-native/framework-base'),
  useReducedMotion: jest.fn(),
}));

const mockUseReducedMotion = jest.mocked(useReducedMotion);

describe('Skeleton', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
    jest.spyOn(Animated, 'loop').mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderSkeleton(props?: React.ComponentProps<typeof Skeleton>) {
    return render(<Skeleton testID="skeleton" {...props} />);
  }

  function getRoot(component: Awaited<ReturnType<typeof renderSkeleton>>) {
    return component.getByTestId('skeleton', { includeHiddenElements: true });
  }

  function getRootStyle(component: Awaited<ReturnType<typeof renderSkeleton>>): ViewStyle {
    return StyleSheet.flatten(getRoot(component).props.style);
  }

  function getNativeNode(component: Awaited<ReturnType<typeof renderSkeleton>>, type: string, testID = 'skeleton') {
    const node = component.getByTestId(testID, { includeHiddenElements: true }).queryAll((instance) => instance.type === type)[0];
    if (!node) {
      throw new Error(`Skeleton must render ${type}.`);
    }
    return node;
  }

  it('renders a decorative bar with themed fill and rounded corners', async () => {
    const component = await renderSkeleton({ style: { height: 16, width: 120 } });

    expect(getRoot(component).props.accessible).toBe(false);
    expect(getRoot(component).props.pointerEvents).toBe('none');
    expect(getRootStyle(component)).toMatchSnapshot();
  });

  it('preserves an explicit pointer-events override', async () => {
    const component = await renderSkeleton({ pointerEvents: 'box-only', style: { height: 16, width: 120 } });

    expect(getRoot(component).props.pointerEvents).toBe('box-only');
  });

  it('forwards user layout handlers while preserving the wave animation', async () => {
    const onLayout = jest.fn();
    const component = await renderSkeleton({ onLayout, style: { height: 16, width: 120 } });
    const root = getRoot(component);

    await act(async () => {
      await fireEvent(root, 'layout', { nativeEvent: { layout: { height: 16, width: 120, x: 0, y: 0 } } });
    });

    expect(onLayout).toHaveBeenCalledTimes(1);
    expect(component.getByTestId('skeleton-shimmer', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('uses the user style after the component style', async () => {
    const component = await renderSkeleton({ style: { backgroundColor: 'hotpink', height: 16, width: 120 } });

    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
  });

  it.each([
    { width: 176, height: 12 },
    { width: 48, height: 48 },
    { width: 224, height: 96 },
    { width: 12, height: 176 },
  ])('renders a soft 45-degree gradient at $width by $height', async ({ width, height }) => {
    const component = await renderSkeleton({ style: { width, height } });
    await fireEvent(getRoot(component), 'layout', { nativeEvent: { layout: { width, height, x: 0, y: 0 } } });
    const gradient = getNativeNode(component, 'RNSVGLinearGradient');
    const bandWidth = Math.max(Math.round(width * 0.45), 24);

    expect(gradient.props).toMatchObject({
      gradientUnits: 1,
      x1: height,
      y1: 0,
      x2: height + bandWidth / 2,
      y2: bandWidth / 2,
    });
    expect(gradient.props.x2 - gradient.props.x1).toBe(gradient.props.y2 - gradient.props.y1);
    const color = processColor(defaultFlexTokens.color.backgroundNeutralSubtle);
    if (typeof color !== 'number') {
      throw new Error('The test theme must supply a concrete SVG highlight color.');
    }
    const rgb = color & 0x00ffffff;
    expect(gradient.props.gradient).toEqual([0, rgb, 0.5, rgb | (Math.round(0.64 * 255) << 24), 1, rgb]);
    expect(getNativeNode(component, 'RNSVGSvgView').props).toMatchObject({
      bbWidth: bandWidth + height,
      bbHeight: height,
      minX: 0,
      minY: 0,
      vbWidth: bandWidth + height,
      vbHeight: height,
    });
    expect(getNativeNode(component, 'RNSVGRect').props).toMatchObject({
      fill: { type: 1, brushRef: gradient.props.name },
      width: bandWidth + height,
      height,
    });
    expect(getRootStyle(component).overflow).toBe('hidden');
  });

  it.each([false, true])('clears the whole angled band at both loop ends with RTL=%s', async (isRTL) => {
    jest.replaceProperty(I18nManager, 'isRTL', isRTL);
    const interpolate = jest.spyOn(Animated.Value.prototype, 'interpolate');
    const component = await renderSkeleton({ style: { width: 120, height: 96 } });
    await fireEvent(getRoot(component), 'layout', { nativeEvent: { layout: { width: 120, height: 96, x: 0, y: 0 } } });

    expect(interpolate).toHaveBeenLastCalledWith({
      inputRange: [0, 1],
      outputRange: isRTL ? [120, -150] : [-150, 120],
    });
  });

  it('keeps gradient definitions unique across instances and stable across resizing', async () => {
    const component = await render(
      <>
        <Skeleton testID="first" style={{ width: 120, height: 16 }} />
        <Skeleton testID="second" style={{ width: 120, height: 16 }} />
      </>,
    );
    for (const testID of ['first', 'second']) {
      await fireEvent(component.getByTestId(testID, { includeHiddenElements: true }), 'layout', {
        nativeEvent: { layout: { width: 120, height: 16, x: 0, y: 0 } },
      });
    }
    const firstId = getNativeNode(component, 'RNSVGLinearGradient', 'first').props.name;
    expect(firstId).not.toBe(getNativeNode(component, 'RNSVGLinearGradient', 'second').props.name);

    await fireEvent(component.getByTestId('first', { includeHiddenElements: true }), 'layout', {
      nativeEvent: { layout: { width: 224, height: 96, x: 0, y: 0 } },
    });
    expect(getNativeNode(component, 'RNSVGLinearGradient', 'first').props.name).toBe(firstId);
    expect(getNativeNode(component, 'RNSVGSvgView', 'first').props).toMatchObject({ bbHeight: 96, bbWidth: 197 });
  });

  it('hides the shimmer when reduce motion is enabled', async () => {
    mockUseReducedMotion.mockReturnValue(true);
    const component = await renderSkeleton({ style: { height: 16, width: 120 } });
    const root = getRoot(component);

    await act(async () => {
      await fireEvent(root, 'layout', { nativeEvent: { layout: { height: 16, width: 120, x: 0, y: 0 } } });
    });

    expect(component.queryByTestId('skeleton-shimmer', { includeHiddenElements: true })).toBeNull();
    expect(getRootStyle(component).backgroundColor).toBe(defaultFlexTokens.color.backgroundNeutralSoft);
    expect(getRootStyle(component).backgroundColor).not.toBe(defaultFlexTokens.color.backgroundNeutralSubtle);
  });

  it('reports unsupported opaque gradient colors and retains a native outlined placeholder', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const theme = new ThemeReference(mockTheme, { colors: { neutralBackground2: PlatformColor('windowBackgroundColor') } });
    const component = await render(
      <ThemeProvider theme={theme} appearance={{ colorScheme: 'dark', contrast: 'highContrast' }}>
        <Skeleton testID="skeleton" style={{ width: 120, height: 16 }} />
      </ThemeProvider>,
    );
    await fireEvent(getRoot(component), 'layout', { nativeEvent: { layout: { width: 120, height: 16, x: 0, y: 0 } } });

    expect(component.queryByTestId('skeleton-shimmer', { includeHiddenElements: true })).toBeNull();
    expect(Animated.loop).not.toHaveBeenCalled();
    expect(getRootStyle(component).borderWidth).toBeGreaterThan(0);
    expect(getRootStyle(component).borderColor).toBeDefined();
    expect(warn).toHaveBeenCalledWith(
      'Skeleton: rendering a static placeholder because native SVG gradients cannot use an opaque highlight color.',
    );
  });

  it('shares one animation timeline across mounted placeholders', async () => {
    const loop = jest.mocked(Animated.loop);
    const component = await render(
      <>
        <Skeleton testID="first" style={{ width: 120, height: 16 }} />
        <Skeleton testID="second" style={{ width: 120, height: 16 }} />
      </>,
    );

    for (const testID of ['first', 'second']) {
      await fireEvent(component.getByTestId(testID, { includeHiddenElements: true }), 'layout', {
        nativeEvent: { layout: { width: 120, height: 16, x: 0, y: 0 } },
      });
    }

    expect(loop).toHaveBeenCalledTimes(1);
  });
});
