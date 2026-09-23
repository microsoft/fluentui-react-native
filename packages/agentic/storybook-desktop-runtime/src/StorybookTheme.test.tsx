import * as React from 'react';
import { StyleSheet, Text } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import { useRootSettings, useThemeState } from '@fluentui-react-native/design';
import type { RootSettings, ThemeState } from '@fluentui-react-native/design';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';
import type { View as StorybookView } from '@storybook/react-native';
import { theme as lightTheme } from '@storybook/react-native-theming';

import { createDesktopStorybookApp } from './createDesktopStorybookApp';
import { DesktopDriverBridge } from './DesktopDriverBridge';
import { StorybookUIComponent } from './StorybookUI';

jest.mock('./DesktopDriverBridge', () => ({ DesktopDriverBridge: jest.fn(() => null) }));
jest.mock('./StorybookUI', () => ({ StorybookUIComponent: jest.fn(() => null) }));

function createTestApp(storyBackgroundColor?: string) {
  const roots: RootSettings[] = [];
  const bridgeRoots: RootSettings[] = [];
  const themes: ThemeState[] = [];
  const mounted = jest.fn();
  const unmounted = jest.fn();

  function Story() {
    roots.push(useRootSettings());
    themes.push(useThemeState());
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
  jest.mocked(StorybookUIComponent).mockImplementation(({ children }) => <>{children}</>);

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
  return { App, roots, bridgeRoots, themes, mounted, unmounted, getStorybookUI };
}

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('Storybook app theme root', () => {
  it('places the toolbar, UI, story, and runtime bridge in the same default Flex scene', async () => {
    const { App, roots, bridgeRoots, themes } = createTestApp();
    const scene = await render(<App />);

    expect(scene.getByTestId('test-app-root')).toBeOnTheScreen();
    expect(scene.getByTestId('test-theme-toolbar')).toBeOnTheScreen();
    expect(scene.getByTestId('selected-story')).toBeOnTheScreen();
    expect(scene.getByRole('button', { name: 'Default Flex' })).toBeOnTheScreen();
    expect(themes[0].tokens).toEqual(defaultFlexTokens);
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

  it.each(['none', 'light', 'dark'])('keeps the %s canvas distinct from the Secondary Button fill', async (choice) => {
    const { App, themes } = createTestApp();
    const scene = await render(<App />);

    await fireEvent.press(scene.getByTestId(`test-theme-${choice}`));

    const state = themes[themes.length - 1];
    const calls = jest.mocked(StorybookUIComponent).mock.calls;
    const theme = calls[calls.length - 1][0].theme;
    expect(theme.background.content).toBe(state.tokens.color.surfaceNeutralFar);
    expect(theme.background.content).toBe(theme.background.preview);
    expect(theme.background.content).not.toBe(state.tokens.color.backgroundNeutralSubtle);
  });

  it.each(['#ffeedd', 'transparent'])('preserves the explicit %s story background across theme changes', async (storyBackgroundColor) => {
    const { App } = createTestApp(storyBackgroundColor);
    const scene = await render(<App />);

    for (const choice of ['none', 'dark', 'light']) {
      await fireEvent.press(scene.getByTestId(`test-theme-${choice}`));
      const calls = jest.mocked(StorybookUIComponent).mock.calls;
      expect(calls[calls.length - 1][0].storyBackgroundColor).toBe(storyBackgroundColor);
    }
  });

  it('switches chrome and story colors together without recreating Storybook or resetting the scene', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const { App, roots, themes, mounted, unmounted, getStorybookUI } = createTestApp();
    const scene = await render(<App />);
    const root = roots[0];
    const defaultBackground = themes[0].tokens.color.surfaceNeutralFar;
    const backgrounds: Record<string, unknown> = {};
    await fireEvent(scene.getByTestId('test-app-root'), 'keyDownCapture', { nativeEvent: { key: 'Tab' } });

    for (const choice of ['dark', 'highContrast', 'light', 'none']) {
      await fireEvent.press(scene.getByTestId(`test-theme-${choice}`));
      const state = themes[themes.length - 1];
      const calls = jest.mocked(StorybookUIComponent).mock.calls;
      const theme = calls[calls.length - 1][0].theme;
      backgrounds[choice] = theme.background.app;

      expect(scene.getByTestId(`test-theme-${choice}`).props.accessibilityState.selected).toBe(true);
      expect(StyleSheet.flatten(scene.getByTestId('test-theme-toolbar').props.style).backgroundColor).toBe(
        state.tokens.color.backgroundNeutralSubtle,
      );
      expect(StyleSheet.flatten(scene.getByText('Theme').props.style).color).toBe(state.tokens.color.foregroundNeutralPrimary);
      const foreground = theme.base === 'dark' ? state.tokens.color.fixedWhite : state.tokens.color.fixedBlack;
      const background = theme.base === 'dark' ? state.tokens.color.fixedBlack : state.tokens.color.fixedWhite;
      const literal = (value: unknown, fallback: unknown) => (typeof value === 'string' ? value : fallback);
      expect(theme.background.app).toBe(literal(state.tokens.color.surfaceNeutralFar, background));
      expect(theme.background.content).toBe(literal(state.tokens.color.surfaceNeutralFar, background));
      expect(theme.background.preview).toBe(literal(state.tokens.color.surfaceNeutralFar, background));
      expect(theme.color.defaultText).toBe(literal(state.tokens.color.foregroundNeutralPrimary, foreground));
      expect(theme.input.color).toBe(literal(state.tokens.color.foregroundNeutralPrimary, foreground));
      expect(theme.button.background).toBe(literal(state.tokens.color.backgroundNeutralLoud, background));
      expect(root.inputModality).toBe('keyboard');
      expect(roots.every((settings) => settings === root)).toBe(true);
    }

    expect(backgrounds.dark).not.toBe(backgrounds.light);
    expect(backgrounds.none).toBe(defaultBackground);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Storybook chrome cannot resolve native system colors'));
    expect(getStorybookUI).toHaveBeenCalledTimes(1);
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(unmounted).not.toHaveBeenCalled();
  });
});
