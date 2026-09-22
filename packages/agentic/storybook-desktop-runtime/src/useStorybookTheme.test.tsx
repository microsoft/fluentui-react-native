import { PlatformColor } from 'react-native';

import { act, render } from '@testing-library/react-native';
import { FlexThemeReference, ThemedRoot, useThemeState } from '@fluentui-react-native/design';
import type { ThemeState } from '@fluentui-react-native/design';
import type { Theme } from '@storybook/react-native-theming';

import { useStorybookTheme } from './useStorybookTheme';

function Probe({ themes, states }: { themes: Theme[]; states?: ThemeState[] }) {
  themes.push(useStorybookTheme());
  const state = useThemeState();
  states?.push(state);
  return null;
}

describe('Storybook theme palette', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('derives colors from the current tokens and updates after source invalidation', async () => {
    const themes: Theme[] = [];
    const states: ThemeState[] = [];
    const source = new FlexThemeReference({
      base: { color: { surfaceNeutralFar: '#123456', foregroundNeutralPrimary: '#abcdef' } },
    });
    const scene = await render(
      <ThemedRoot theme={source}>
        <Probe themes={themes} states={states} />
      </ThemedRoot>,
    );

    expect(themes[0].background.app).toBe('#123456');
    expect(themes[0].color.defaultText).toBe('#abcdef');
    await scene.rerender(
      <ThemedRoot theme={source}>
        <Probe themes={themes} states={states} />
      </ThemedRoot>,
    );
    expect(themes[themes.length - 1]).toBe(themes[0]);

    await act(() => source.update({ color: { surfaceNeutralFar: '#654321' } }));
    expect(themes[themes.length - 1].background.app).toBe('#654321');
    expect(themes[themes.length - 1]).not.toBe(themes[0]);
    expect(themes[themes.length - 1].appBorderColor).toBe(states[states.length - 1].tokens.color.strokeNeutralSubtle);
  });

  it('warns and substitutes a contrasting theme color for native opaque colors', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const themes: Theme[] = [];
    const states: ThemeState[] = [];
    const source = new FlexThemeReference({ base: { color: { foregroundBrandPrimary: PlatformColor('labelColor') } } });
    await render(
      <ThemedRoot theme={source}>
        <Probe themes={themes} states={states} />
      </ThemedRoot>,
    );
    expect(themes[0].color.primary).toBe(states[0].tokens.color.fixedBlack);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('foregroundBrandPrimary'));
  });
});
