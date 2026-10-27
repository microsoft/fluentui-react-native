import * as React from 'react';
import { StyleSheet, Text } from 'react-native';

import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRootSettings, useThemeState } from '@fluentui-react-native/design';
import type { RootSettings, ThemeState } from '@fluentui-react-native/design';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';
import type { View as StorybookView } from '@storybook/react-native';
import { theme as lightTheme } from '@storybook/react-native-theming';

import { createDesktopStorybookApp } from './createDesktopStorybookApp';
import { DesktopDriverBridge } from './DesktopDriverBridge';
import { StorybookUIComponent } from './StorybookUI';

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  dispatchCommand: jest.fn(),
  findNodeHandle: jest.fn(() => 42),
}));
jest.mock('./DesktopDriverBridge', () => ({ DesktopDriverBridge: jest.fn(() => null) }));
jest.mock('./StorybookUI', () => ({ StorybookUIComponent: jest.fn(() => null) }));

const keyboardPress = { nativeEvent: { key: 'Enter' } };

async function selectThemeOption(axis: 'source' | 'color-scheme' | 'contrast', value: string) {
  const triggerID = `test-theme-${axis}-trigger`;
  const listboxID = `test-theme-${axis}-listbox`;
  await fireEvent(screen.getByTestId(triggerID), 'press', keyboardPress);
  const listbox = screen.getByTestId(listboxID);
  await fireEvent(listbox, 'ready', { nativeEvent: { generation: listbox.props.commandGeneration } });
  await fireEvent(screen.getByTestId(`test-theme-${axis}-${value}`), 'press', keyboardPress);
}

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
  it('places the theme controls, UI, story, and runtime bridge in the inherited Flex scene', async () => {
    const { App, roots, bridgeRoots, themes } = createTestApp();
    const scene = await render(<App />);

    expect(scene.getByTestId('test-app-root')).toBeOnTheScreen();
    expect(scene.getByTestId('test-theme-toolbar')).toBeOnTheScreen();
    expect(scene.getByTestId('selected-story')).toBeOnTheScreen();
    expect(scene.getByTestId('test-theme-source-trigger').props.accessibilityValue.text).toBe('Inherited theme');
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

  it.each(['inherit', 'flex', 'fluent'])('keeps the %s canvas distinct from the Secondary Button fill', async (source) => {
    const { App, themes } = createTestApp();
    const scene = await render(<App />);

    await selectThemeOption('source', source);

    const state = themes[themes.length - 1];
    const calls = jest.mocked(StorybookUIComponent).mock.calls;
    const theme = calls[calls.length - 1][0].theme;
    expect(theme.background.content).toBe(state.tokens.color.surfaceNeutralFar);
    expect(theme.background.content).toBe(theme.background.preview);
    expect(theme.background.content).not.toBe(state.tokens.color.backgroundNeutralSubtle);
    expect(scene.getByTestId('test-theme-source-trigger').props.accessibilityValue.text).toBe(
      source === 'inherit' ? 'Inherited theme' : source === 'flex' ? 'Default Flex' : 'Default Fluent',
    );
  });

  it.each(['#ffeedd', 'transparent'])('preserves the explicit %s story background across theme changes', async (storyBackgroundColor) => {
    const { App } = createTestApp(storyBackgroundColor);
    await render(<App />);

    for (const source of ['flex', 'fluent', 'inherit']) {
      await selectThemeOption('source', source);
      const calls = jest.mocked(StorybookUIComponent).mock.calls;
      expect(calls[calls.length - 1][0].storyBackgroundColor).toBe(storyBackgroundColor);
    }
  });

  it('switches Fluent appearance and chrome without recreating Storybook or resetting the scene', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const { App, roots, themes, mounted, unmounted, getStorybookUI } = createTestApp();
    const scene = await render(<App />);
    const root = roots[0];
    const defaultBackground = themes[0].tokens.color.surfaceNeutralFar;
    const backgrounds: Record<string, unknown> = {};
    await fireEvent(scene.getByTestId('test-app-root'), 'keyDownCapture', { nativeEvent: { key: 'Tab' } });

    await selectThemeOption('source', 'fluent');
    for (const [scheme, contrast] of [
      ['dark', 'system'],
      ['dark', 'highContrast'],
      ['light', 'highContrast'],
      ['light', 'standard'],
    ]) {
      await selectThemeOption('color-scheme', scheme);
      await selectThemeOption('contrast', contrast);
      const state = themes[themes.length - 1];
      const calls = jest.mocked(StorybookUIComponent).mock.calls;
      const theme = calls[calls.length - 1][0].theme;
      backgrounds[scheme] = theme.background.app;

      expect(scene.getByTestId(`test-theme-color-scheme-trigger`).props.accessibilityValue.text).toBe(scheme === 'dark' ? 'Dark' : 'Light');
      expect(StyleSheet.flatten(scene.getByTestId('test-theme-toolbar').props.style).backgroundColor).toBe(
        state.tokens.color.backgroundNeutralSubtle,
      );
      expect(StyleSheet.flatten(scene.getByText('Theme').props.style).color).toEqual(state.tokens.color.foregroundNeutralPrimary);
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
    expect(themes[0].tokens.color.surfaceNeutralFar).toBe(defaultBackground);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Storybook chrome cannot resolve native system colors'));
    expect(getStorybookUI).toHaveBeenCalledTimes(1);
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(unmounted).not.toHaveBeenCalled();
  });
});
