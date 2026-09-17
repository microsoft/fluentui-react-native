/** @jsxImportSource @fluentui-react-native/framework-base */
import { Platform, StyleSheet, View } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { FlexThemeReference, ThemedRoot, useThemeState } from '@fluentui-react-native/design';
import type { ThemeState } from '@fluentui-react-native/design';

import { applyFocusRingStyles } from './applyFocusRingStyles';
import { render } from './renderWithTheme';
import { useFocusVisuals } from './useFocusVisuals';
import type { FocusVisualsOptions, FocusVisualsState } from './useFocusVisuals';

function Probe({ seen, radius = 4, ...options }: FocusVisualsOptions & { seen: FocusVisualsState[]; radius?: number }) {
  const theme = useThemeState();
  const result = useFocusVisuals(options);
  applyFocusRingStyles(result.FocusRing, theme, radius);
  seen.push(result);
  const { FocusRing, ...nativeProps } = result;
  return (
    <View {...nativeProps} testID="focus-target">
      {FocusRing && <FocusRing />}
    </View>
  );
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useFocusVisuals', () => {
  it.each([
    ['windows', true],
    ['macos', true],
    ['win32', false],
    ['ios', false],
    ['android', false],
    ['web', false],
  ] as const)('defaults on %s to native=%s', async (platform, native) => {
    jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    const seen: FocusVisualsState[] = [];
    const component = await render(<Probe focused seen={seen} />);
    expect(seen[0].enableFocusRing).toBe(native);
    expect(Boolean(seen[0].FocusRing)).toBe(!native);
    expect(Boolean(component.queryByTestId('focus-visual', { includeHiddenElements: true }))).toBe(!native);
  });

  it.each([true, false])('honors the explicit native-ring preference %s', async (useSystemFocusRing) => {
    const seen: FocusVisualsState[] = [];
    await render(<Probe focused seen={seen} useSystemFocusRing={useSystemFocusRing} />);
    expect(seen[0].enableFocusRing).toBe(useSystemFocusRing);
    expect(Boolean(seen[0].FocusRing)).toBe(!useSystemFocusRing);
  });

  it('updates the focused ring on modality changes without manually rerendering', async () => {
    const seen: FocusVisualsState[] = [];
    const component = await render(<Probe focused={false} seen={seen} useSystemFocusRing={false} />);
    const ring = component.getByTestId('focus-visual', { includeHiddenElements: true });
    const slot = seen[0].FocusRing;
    const count = seen.length;

    await fireEvent(component.getByTestId('test-scene-root'), 'keyDownCapture', { nativeEvent: { key: 'Tab' } });
    expect(seen).toHaveLength(count);
    await component.rerender(<Probe focused seen={seen} useSystemFocusRing={false} />);
    expect(StyleSheet.flatten(ring.props.style).opacity).toBeUndefined();

    await fireEvent(component.getByTestId('test-scene-root'), 'pointerDownCapture', {});
    expect(StyleSheet.flatten(ring.props.style).opacity).toBe(0);
    await fireEvent(component.getByTestId('test-scene-root'), 'keyDownCapture', { nativeEvent: { key: 'Tab' } });
    expect(StyleSheet.flatten(ring.props.style).opacity).toBeUndefined();
    await component.rerender(<Probe focused={false} seen={seen} useSystemFocusRing={false} />);
    const unfocusedCount = seen.length;
    await fireEvent(component.getByTestId('test-scene-root'), 'pointerDownCapture', {});
    expect(seen).toHaveLength(unfocusedCount);
    expect(seen.every(({ FocusRing }) => FocusRing === slot)).toBe(true);
    expect(component.getByTestId('focus-visual', { includeHiddenElements: true })).toBe(ring);
  });

  it('alwaysVisible uses a custom ring for pointer focus, but never forces unfocused visibility', async () => {
    const seen: FocusVisualsState[] = [];
    const component = await render(<Probe focused seen={seen} useSystemFocusRing alwaysVisible />);
    const ring = component.getByTestId('focus-visual', { includeHiddenElements: true });
    expect(seen[0].enableFocusRing).toBe(false);
    expect(StyleSheet.flatten(ring.props.style).opacity).toBeUndefined();

    await component.rerender(<Probe focused={false} seen={seen} useSystemFocusRing alwaysVisible />);
    expect(seen[seen.length - 1].enableFocusRing).toBe(false);
    expect(StyleSheet.flatten(ring.props.style).opacity).toBe(0);
    expect(seen[seen.length - 1].FocusRing).toBe(seen[0].FocusRing);
  });

  it('switches optional-slot presence without violating hook order', async () => {
    const seen: FocusVisualsState[] = [];
    const component = await render(<Probe focused seen={seen} useSystemFocusRing />);
    expect(seen[0].FocusRing).toBeUndefined();
    await component.rerender(<Probe focused seen={seen} useSystemFocusRing={false} />);
    expect(seen[seen.length - 1].FocusRing).toBeDefined();
    await component.rerender(<Probe focused seen={seen} useSystemFocusRing />);
    expect(seen[seen.length - 1].FocusRing).toBeUndefined();
    expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
  });

  it('applies theme colors and widths centrally, without caching instance radii or visibility', async () => {
    const theme = new FlexThemeReference({
      base: {
        color: { strokeFocusInner: '#123456', strokeFocusOuter: '#abcdef' },
        strokeWidth: { thin: 3, thick: 5 },
      },
    });
    const seen: FocusVisualsState[] = [];
    const element = (radius: number, focused: boolean) => (
      <ThemedRoot theme={theme}>
        <Probe focused={focused} seen={seen} radius={radius} useSystemFocusRing={false} alwaysVisible />
      </ThemedRoot>
    );
    const component = await render(element(6, true));
    const outer = component.getByTestId('focus-visual', { includeHiddenElements: true });
    const inner = component.getByTestId('focus-visual-inner', { includeHiddenElements: true });
    expect(StyleSheet.flatten(outer.props.style)).toMatchObject({ borderColor: '#abcdef', borderWidth: 5, borderRadius: 6 });
    expect(StyleSheet.flatten(inner.props.style)).toMatchObject({ borderColor: '#123456', borderWidth: 3, borderRadius: 6 });

    const createSheet = jest.spyOn(StyleSheet, 'create');
    await component.rerender(element(12, false));
    expect(createSheet).not.toHaveBeenCalled();
    expect(StyleSheet.flatten(outer.props.style)).toMatchObject({ borderRadius: 12, opacity: 0 });
    expect(StyleSheet.flatten(inner.props.style).borderRadius).toBe(12);
  });

  it('does not resolve custom styles when the optional slot is absent', () => {
    const getTokens = jest.fn(() => {
      throw new Error('Unexpected token access');
    });
    const theme: ThemeState = {
      get tokens() {
        return getTokens();
      },
      appearance: { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' },
      highContrast: false,
      themeStyles: {},
    };
    applyFocusRingStyles(undefined, theme, 4);
    expect(getTokens).not.toHaveBeenCalled();
  });
});
