import type { PropsWithChildren } from 'react';
import { Text } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { FlexThemeReference, ThemeProvider, useRootSettings, useThemeState } from '@fluentui-react-native/design';
import type { RootSettings, ThemeState } from '@fluentui-react-native/design';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { render } from './renderWithTheme';

function Probe({ roots, themes, label = 'Probe' }: { roots: RootSettings[]; themes?: ThemeState[]; label?: string }) {
  roots.push(useRootSettings());
  const theme = useThemeState();
  themes?.push(theme);
  return <Text>{label}</Text>;
}

describe('themed test scenes', () => {
  it('provides the default theme and live modality without rendering again', async () => {
    const roots: RootSettings[] = [];
    const themes: ThemeState[] = [];
    const scene = await render(<Probe roots={roots} themes={themes} />);
    const root = roots[0];
    const renderCount = roots.length;

    expect(themes[0].tokens).toEqual(defaultFlexTokens);
    expect(root.inputModality).toBe('pointer');
    await fireEvent(scene.getByTestId('test-scene-root'), 'keyDownCapture', { nativeEvent: { key: 'Tab' } });
    expect(root.inputModality).toBe('keyboard');
    await fireEvent(scene.getByTestId('test-scene-root'), 'pointerDownCapture', {});
    expect(root.inputModality).toBe('pointer');
    expect(roots).toHaveLength(renderCount);
  });

  it('keeps the same scene root when rerendering', async () => {
    const roots: RootSettings[] = [];
    const scene = await render(<Probe roots={roots} />);
    await fireEvent(scene.getByTestId('test-scene-root'), 'keyDownCapture', { nativeEvent: { key: 'Tab' } });

    await scene.rerender(<Probe roots={roots} label="Updated" />);

    expect(scene.getByText('Updated')).toBeOnTheScreen();
    expect(roots.every((root) => root === roots[0])).toBe(true);
    expect(roots[0].inputModality).toBe('keyboard');
  });

  it('places supplied wrappers inside the scene while preserving their theme', async () => {
    const roots: RootSettings[] = [];
    const wrapperRoots: RootSettings[] = [];
    const themes: ThemeState[] = [];
    const theme = new FlexThemeReference({ base: { color: { foregroundNeutralPrimary: '#123456' } } });
    function Wrapper({ children }: PropsWithChildren) {
      wrapperRoots.push(useRootSettings());
      return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
    }

    const scene = await render(<Probe roots={roots} themes={themes} />, { wrapper: Wrapper });
    await scene.rerender(<Probe roots={roots} themes={themes} label="Updated" />);

    expect(wrapperRoots.every((root) => root === roots[0])).toBe(true);
    expect(themes.every((state) => state.tokens.color.foregroundNeutralPrimary === '#123456')).toBe(true);
    expect(roots.every((root) => root === roots[0])).toBe(true);
  });

  it('isolates separate rendered scenes', async () => {
    const first: RootSettings[] = [];
    const second: RootSettings[] = [];
    const scene = await render(<Probe roots={first} />);
    await fireEvent(scene.getByTestId('test-scene-root'), 'keyDownCapture', { nativeEvent: { key: 'Tab' } });
    const secondScene = await render(<Probe roots={second} />);

    expect(first[0]).not.toBe(second[0]);
    expect(first[0].inputModality).toBe('keyboard');
    expect(second[0].inputModality).toBe('pointer');
    await fireEvent(secondScene.getByTestId('test-scene-root'), 'pointerDownCapture', {});
    expect(first[0].inputModality).toBe('keyboard');
  });
});
