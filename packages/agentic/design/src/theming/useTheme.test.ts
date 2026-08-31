import * as React from 'react';

import { act, create } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';

import { mockTheme } from '../testing/mockTheme';
import { useThemeState } from '../useThemeState';
import type { ThemeState } from '../useThemeState';
import type { ThemeAppearanceSource } from './appearance.types';
import { ThemeContext } from './context';
import { FlexThemeReference } from './flexThemeReference';
import { ThemeProvider } from './ThemeProvider';
import type { Theme } from './types/Theme.types';
import { useTheme } from './useTheme';

const lightAppearanceSnapshot = { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' } as const;
const lightAppearanceSource: ThemeAppearanceSource = {
  getSnapshot: () => lightAppearanceSnapshot,
  subscribe: () => () => undefined,
};

function LegacyThemeProbe({ themes }: { themes: Theme[] }) {
  themes.push(useTheme());
  return null;
}

function BothThemeModelsProbe({ themes, states }: { themes: Theme[]; states: ThemeState[] }) {
  themes.push(useTheme());
  states.push(useThemeState());
  return null;
}

describe('useTheme', () => {
  it('converts a Flex source lazily and shares the legacy Theme per revision and appearance', () => {
    const resolveBase = jest.fn(() => ({ color: { backgroundBrandHeavy: '#123456' } }));
    const reference = new FlexThemeReference({
      base: resolveBase,
      legacyFallback: {
        components: {
          TestComponent: {
            tokens: {
              custom: true,
            },
          },
        },
      },
    });
    const themes: Theme[] = [];
    let component: ReactTestRenderer;

    act(() => {
      component = create(
        React.createElement(
          ThemeProvider,
          { theme: reference, appearanceSource: lightAppearanceSource },
          React.createElement(React.Fragment),
        ),
      );
    });
    expect(resolveBase).not.toHaveBeenCalled();

    act(() => {
      component!.update(
        React.createElement(
          ThemeProvider,
          { theme: reference, appearanceSource: lightAppearanceSource },
          React.createElement(
            React.Fragment,
            null,
            React.createElement(LegacyThemeProbe, { themes }),
            React.createElement(LegacyThemeProbe, { themes }),
          ),
        ),
      );
    });

    expect(resolveBase).toHaveBeenCalledTimes(1);
    expect(themes[0]).toBe(themes[1]);
    expect(themes[0].colors.brandBackground).toBe('#123456');
    expect(themes[0].components.TestComponent).toEqual({ tokens: { custom: true } });

    const firstTheme = themes[0];
    act(() => reference.invalidate());
    expect(resolveBase).toHaveBeenCalledTimes(2);
    expect(themes.at(-1)).not.toBe(firstTheme);
    act(() => component!.unmount());
  });

  it('uses a nearer raw ThemeContext provider for both legacy and modern hooks', () => {
    const reference = new FlexThemeReference({
      base: { color: { backgroundBrandHeavy: '#123456' } },
    });
    const rawTheme: Theme = {
      ...mockTheme,
      colors: {
        ...mockTheme.colors,
        neutralBackground2: '#654321',
      },
    };
    const themes: Theme[] = [];
    const states: ThemeState[] = [];
    let component: ReactTestRenderer;

    act(() => {
      component = create(
        React.createElement(
          ThemeProvider,
          { theme: reference, appearanceSource: lightAppearanceSource },
          React.createElement(ThemeContext.Provider, { value: rawTheme }, React.createElement(BothThemeModelsProbe, { themes, states })),
        ),
      );
    });

    expect(themes[0]).toBe(rawTheme);
    expect(states[0].tokens.color.backgroundNeutralSubtle).toBe('#654321');
    act(() => component!.unmount());
  });
});
