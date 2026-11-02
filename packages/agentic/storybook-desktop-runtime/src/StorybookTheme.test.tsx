import * as React from 'react';
import { Appearance, StyleSheet, Text } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import { FlexThemeReference, useRootSettings, useThemeAppearance, useThemeState } from '@fluentui-react-native/design';
import type { RootSettings, ThemeAppearanceState, ThemeState } from '@fluentui-react-native/design';
import { ThemeContext } from '@fluentui-react-native/design/theming';
import type { Theme as LegacyTheme } from '@fluentui-react-native/design/theming';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';
import type { View as StorybookView } from '@storybook/react-native';
import { theme as lightTheme } from '@storybook/react-native-theming';

import { createDesktopStorybookApp } from './createDesktopStorybookApp';
import { DesktopDriverBridge } from './DesktopDriverBridge';
import { StorybookUIComponent } from './StorybookUI';

jest.mock('./DesktopDriverBridge', () => ({ DesktopDriverBridge: jest.fn(() => null) }));
jest.mock('./StorybookUI', () => ({ StorybookUIComponent: jest.fn(() => null) }));

type Scene = Awaited<ReturnType<typeof render>>;

function createTestApp(storyBackgroundColor?: string) {
  const roots: RootSettings[] = [];
  const bridgeRoots: RootSettings[] = [];
  const themes: ThemeState[] = [];
  const chromeThemes: ThemeState[] = [];
  const appearances: ThemeAppearanceState[] = [];
  const legacyThemes: (LegacyTheme | undefined)[] = [];
  const mounted = jest.fn();
  const unmounted = jest.fn();

  function Story() {
    roots.push(useRootSettings());
    themes.push(useThemeState());
    appearances.push(useThemeAppearance());
    legacyThemes.push(React.useContext(ThemeContext));
    React.useEffect(() => {
      mounted();
      return unmounted;
    }, []);
    return <Text testID="selected-story">Selected story</Text>;
  }

  jest.mocked(DesktopDriverBridge).mockImplementation(() => {
    bridgeRoots.push(useRootSettings());
    return null;
  });
  jest.mocked(StorybookUIComponent).mockImplementation(({ children }) => {
    chromeThemes.push(useThemeState());
    return <>{children}</>;
  });

  const getStorybookUI = jest.fn<ReturnType<StorybookView['getStorybookUI']>, Parameters<StorybookView['getStorybookUI']>>((params) => {
    const UI = params?.CustomUIComponent;
    if (!UI) {
      throw new Error('Expected the app factory to configure the themed UI.');
    }
    return () => (
      <UI
        storyBackgroundColor={storyBackgroundColor}
        storyHash={{}}
        setStory={jest.fn()}
        storage={{ getItem: () => null, setItem: () => undefined }}
        theme={lightTheme}
      >
        <Story />
      </UI>
    );
  });
  const App = createDesktopStorybookApp({ getStorybookUI }, { enableWebsockets: false, testIDPrefix: 'test' });
  return { App, roots, bridgeRoots, themes, chromeThemes, appearances, legacyThemes, mounted, unmounted, getStorybookUI };
}

async function selectTheme(scene: Scene, axis: string, value: string) {
  await fireEvent.press(scene.getByTestId(`test-theme-${axis}`));
  await fireEvent.press(scene.getByTestId(`test-theme-${axis}-${value}`));
}

function latestStorybookTheme() {
  const calls = jest.mocked(StorybookUIComponent).mock.calls;
  return calls[calls.length - 1][0].theme;
}

const selectionSteps = [
  ['scheme', 'dark'],
  ['tone', 'warm'],
  ['contrast', 'highContrast'],
  ['source', 'fluent'],
  ['contrast', 'standard'],
  ['scheme', 'light'],
  ['source', 'flex'],
  ['tone', 'cool'],
] as const;

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('Storybook app theme root', () => {
  it('places the toolbar, UI, story, and runtime bridge in one deterministic default Flex scene', async () => {
    const { App, roots, bridgeRoots, themes, chromeThemes, appearances, legacyThemes } = createTestApp();
    const scene = await render(<App />);

    expect(scene.getByTestId('test-app-root')).toBeOnTheScreen();
    expect(scene.getByTestId('test-theme-toolbar')).toBeOnTheScreen();
    expect(scene.getByTestId('selected-story')).toBeOnTheScreen();
    for (const [axis, label] of [
      ['source', 'Flex'],
      ['scheme', 'Light'],
      ['contrast', 'Standard'],
      ['tone', 'Cool'],
    ]) {
      const trigger = scene.getByTestId(`test-theme-${axis}`);
      expect(trigger.props.accessibilityValue).toEqual({ text: label });
      expect(trigger.props.accessibilityState).toEqual({ disabled: false, expanded: false });
    }
    expect(appearances[0]).toEqual({
      requested: { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'system', colorTone: 'cool' },
      resolved: { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base', colorTone: 'cool' },
    });
    expect(themes[0].appearance).toBe(appearances[0].resolved);
    expect(themes[0].tokens).toEqual(defaultFlexTokens);
    expect(chromeThemes[0]).toBe(themes[0]);
    expect(legacyThemes[0]).toBeUndefined();
    expect(bridgeRoots.every((root) => root === roots[0])).toBe(true);
    expect(roots[0].inputModality).toBe('pointer');
  });

  it('observes app-root input without rerendering the story', async () => {
    const { App, roots, bridgeRoots } = createTestApp();
    const scene = await render(<App />);
    const renderCount = roots.length;
    const root = scene.getByTestId('test-app-root');

    await fireEvent(root, 'keyDownCapture', { nativeEvent: { key: 'Tab' } });
    expect(roots[0].inputModality).toBe('keyboard');
    expect(bridgeRoots[0].inputModality).toBe('keyboard');
    await fireEvent(root, 'pointerDownCapture', {});
    expect(roots[0].inputModality).toBe('pointer');
    await fireEvent(root, 'keyDownCapture', { nativeEvent: { key: 'ArrowRight' } });
    await fireEvent(root, 'startShouldSetResponderCapture', {});
    expect(roots[0].inputModality).toBe('pointer');
    expect(roots).toHaveLength(renderCount);
  });

  it('opens one axis menu at a time and closes it after a selection', async () => {
    const { App } = createTestApp();
    const scene = await render(<App />);

    await fireEvent.press(scene.getByTestId('test-theme-scheme'));
    expect(scene.getByTestId('test-theme-scheme').props.accessibilityState.expanded).toBe(true);
    expect(scene.getByTestId('test-theme-scheme-light').props.accessibilityState.selected).toBe(true);
    expect(scene.getByTestId('test-theme-scheme-system')).toBeOnTheScreen();

    await fireEvent.press(scene.getByTestId('test-theme-source'));
    expect(scene.queryByTestId('test-theme-scheme-menu')).toBeNull();
    expect(scene.getByTestId('test-theme-source-menu')).toBeOnTheScreen();

    await fireEvent.press(scene.getByTestId('test-theme-source'));
    expect(scene.queryByTestId('test-theme-source-menu')).toBeNull();

    await selectTheme(scene, 'scheme', 'dark');
    expect(scene.queryByTestId('test-theme-scheme-menu')).toBeNull();
    expect(scene.getByTestId('test-theme-scheme').props.accessibilityValue).toEqual({ text: 'Dark' });
  });

  it('applies scheme, contrast, and tone to the Flex defaults', async () => {
    const { App, themes } = createTestApp();
    const scene = await render(<App />);
    const coolLight = themes[themes.length - 1].tokens;

    await selectTheme(scene, 'tone', 'warm');
    const warmLight = themes[themes.length - 1];
    expect(warmLight.appearance).toEqual({ colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base', colorTone: 'warm' });
    expect(warmLight.tokens.color.surfaceNeutralFar.rest).not.toBe(coolLight.color.surfaceNeutralFar.rest);

    await selectTheme(scene, 'scheme', 'dark');
    const warmDark = themes[themes.length - 1];
    expect(warmDark.appearance.colorScheme).toBe('dark');
    expect(warmDark.tokens.color.surfaceNeutralFar.rest).not.toBe(warmLight.tokens.color.surfaceNeutralFar.rest);
    expect(warmDark.tokens.color.backgroundBrandLoud.hover).not.toBe(warmDark.tokens.color.backgroundBrandLoud.rest);

    await selectTheme(scene, 'contrast', 'highContrast');
    const highContrast = themes[themes.length - 1];
    expect(highContrast.appearance.contrast).toBe('highContrast');
    expect(highContrast.tokens.color.backgroundBrandLoud.hover).toBe(highContrast.tokens.color.backgroundBrandLoud.rest);
    expect(highContrast.tokens.color.backgroundBrandLoud.pressed).toBe(highContrast.tokens.color.backgroundBrandLoud.rest);
  });

  it('follows the platform scheme only when System is selected', async () => {
    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');
    const { App, themes, appearances } = createTestApp();
    const scene = await render(<App />);
    expect(themes[themes.length - 1].appearance.colorScheme).toBe('light');

    await selectTheme(scene, 'scheme', 'system');
    expect(appearances[appearances.length - 1].requested.colorScheme).toBe('system');
    expect(themes[themes.length - 1].appearance.colorScheme).toBe('dark');
  });

  it('applies the legacy Fluent default theme to stories without tone and restores the Flex tone', async () => {
    const { App, themes, chromeThemes, legacyThemes } = createTestApp();
    const scene = await render(<App />);
    await selectTheme(scene, 'tone', 'warm');

    await selectTheme(scene, 'source', 'fluent');
    const tone = scene.getByTestId('test-theme-tone');
    expect(tone.props.accessibilityState).toEqual({ disabled: true, expanded: false });
    expect(tone.props.accessibilityValue).toEqual({ text: 'Cool' });
    await fireEvent.press(tone);
    expect(scene.queryByTestId('test-theme-tone-menu')).toBeNull();
    expect(themes[themes.length - 1].appearance.colorTone).toBe('cool');
    expect(themes[themes.length - 1].tokens).not.toEqual(defaultFlexTokens);
    expect(chromeThemes[chromeThemes.length - 1].tokens).toEqual(defaultFlexTokens);
    expect(legacyThemes[legacyThemes.length - 1]?.host.appearance).toBe('light');

    await selectTheme(scene, 'scheme', 'dark');
    expect(legacyThemes[legacyThemes.length - 1]?.host.appearance).toBe('dark');
    await selectTheme(scene, 'contrast', 'highContrast');
    expect(legacyThemes[legacyThemes.length - 1]?.host.appearance).toBe('highContrast');

    await selectTheme(scene, 'source', 'flex');
    expect(legacyThemes[legacyThemes.length - 1]).toBeUndefined();
    expect(scene.getByTestId('test-theme-tone').props.accessibilityValue).toEqual({ text: 'Warm' });
    expect(themes[themes.length - 1].appearance.colorTone).toBe('warm');
  });

  it.each([
    ['flex', 'light'],
    ['flex', 'dark'],
    ['fluent', 'light'],
    ['fluent', 'dark'],
  ])('keeps the Flex canvas distinct from the %s %s Secondary Button fill', async (source, scheme) => {
    const { App, themes, chromeThemes } = createTestApp();
    const scene = await render(<App />);

    await selectTheme(scene, 'source', source);
    await selectTheme(scene, 'scheme', scheme);

    const story = themes[themes.length - 1];
    const chrome = chromeThemes[chromeThemes.length - 1];
    const theme = latestStorybookTheme();
    expect(theme.background.content).toBe(chrome.tokens.color.surfaceNeutralFar.rest);
    expect(theme.background.content).toBe(theme.background.preview);
    expect(theme.background.content).not.toBe(story.tokens.color.backgroundNeutralSubtle.rest);
  });

  it.each(['#ffeedd', 'transparent'])('preserves the explicit %s story background across theme changes', async (storyBackgroundColor) => {
    const { App } = createTestApp(storyBackgroundColor);
    const scene = await render(<App />);

    for (const [axis, value] of selectionSteps) {
      await selectTheme(scene, axis, value);
      const calls = jest.mocked(StorybookUIComponent).mock.calls;
      expect(calls[calls.length - 1][0].storyBackgroundColor).toBe(storyBackgroundColor);
    }
  });

  it('switches Flex chrome and selected story colors together without recreating Storybook or resetting the scene', async () => {
    const flex = new FlexThemeReference();
    const { App, roots, themes, chromeThemes, mounted, unmounted, getStorybookUI } = createTestApp();
    const scene = await render(<App />);
    const root = roots[0];
    const defaultBackground = themes[0].tokens.color.surfaceNeutralFar.rest;
    const backgrounds = new Set<unknown>([defaultBackground]);
    let source = 'flex';
    await fireEvent(scene.getByTestId('test-app-root'), 'keyDownCapture', { nativeEvent: { key: 'Tab' } });

    for (const [axis, value] of selectionSteps) {
      await selectTheme(scene, axis, value);
      source = axis === 'source' ? value : source;
      const story = themes[themes.length - 1];
      const chrome = chromeThemes[chromeThemes.length - 1];
      const { color } = chrome.tokens;
      const theme = latestStorybookTheme();
      backgrounds.add(theme.background.app);

      expect(chrome.appearance).toEqual(story.appearance);
      expect(chrome.tokens).toEqual(flex.resolveFlexTokens(chrome.appearance));
      expect(story === chrome).toBe(source === 'flex');
      expect(StyleSheet.flatten(scene.getByTestId('test-theme-toolbar').props.style).backgroundColor).toBe(
        color.backgroundNeutralSubtle.rest,
      );
      expect(StyleSheet.flatten(scene.getByText('Theme').props.style).color).toBe(color.foregroundNeutralPrimary.rest);
      expect(theme.background.app).toBe(color.surfaceNeutralFar.rest);
      expect(theme.background.content).toBe(color.surfaceNeutralFar.rest);
      expect(theme.background.preview).toBe(color.surfaceNeutralFar.rest);
      expect(theme.color.defaultText).toBe(color.foregroundNeutralPrimary.rest);
      expect(theme.input.color).toBe(color.foregroundNeutralPrimary.rest);
      expect(theme.button.background).toBe(color.backgroundNeutralLoud.rest);
      expect(root.inputModality).toBe('keyboard');
      expect(roots.every((settings) => settings === root)).toBe(true);
    }

    expect(themes[themes.length - 1].tokens.color.surfaceNeutralFar.rest).toBe(defaultBackground);
    expect(backgrounds.size).toBeGreaterThan(3);
    expect(getStorybookUI).toHaveBeenCalledTimes(1);
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(unmounted).not.toHaveBeenCalled();
  });
});
