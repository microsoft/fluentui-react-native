import { isDeepStrictEqual } from 'node:util';

import { Appearance } from 'react-native';

import { act, create } from 'react-test-renderer';

import { getDefaultLegacyTheme } from '../../fluent/compat/defaultLegacyTheme';
import {
  darkAliasColors,
  darkShadows,
  fontAliasTokens,
  lightAliasColors,
  lightShadows,
} from '../../fluent/defaults/fluentTokens.generated';
import type { Theme } from '../../fluent/types/Theme.types';
import { useTheme } from '../../fluent/useTheme';
import { useThemeState } from '../../flex/useThemeState';
import { ThemedRoot } from '../../theming/ThemedRoot';
import { ThemeProvider } from '../../theming/ThemeProvider';
import type { ThemeAppearanceSource, ThemeAppearanceSourceSnapshot } from '../../types/appearance.types';
import { fluentDarkTheme, fluentLightTheme, fluentTheme } from '../index';

const themes = [
  ['light', fluentLightTheme, lightAliasColors, lightShadows],
  ['dark', fluentDarkTheme, darkAliasColors, darkShadows],
] as const;

function undefinedPaths(value: unknown, path = 'theme'): string[] {
  if (value === undefined) {
    return [path];
  }
  if (typeof value !== 'object' || value === null) {
    return [];
  }
  return Object.entries(value).flatMap(([key, child]) => undefinedPaths(child, `${path}.${key}`));
}

function createAppearanceSource(initial: ThemeAppearanceSourceSnapshot) {
  let snapshot = initial;
  const listeners = new Set<() => void>();
  return {
    source: {
      getSnapshot: () => snapshot,
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    } satisfies ThemeAppearanceSource,
    update(next: ThemeAppearanceSourceSnapshot) {
      snapshot = next;
      listeners.forEach((listener) => listener());
    },
  };
}

function ThemeProbe({ themes: seen }: { themes: Theme[] }) {
  seen.push(useTheme());
  return null;
}

describe.each(themes)('Fluent %s theme', (appearance, theme, aliasColors, shadows) => {
  it('carries every Fluent 2 alias color unchanged for its host appearance', () => {
    expect(theme.host.appearance).toBe(appearance);
    for (const [name, color] of Object.entries(aliasColors)) {
      expect(theme.colors[name]).toBe(color);
    }
  });

  it('draws every legacy palette color from the alias colors', () => {
    const aliasValues = Object.values(aliasColors);
    const invented = Object.entries(theme.colors)
      .filter(([name]) => !(name in aliasColors))
      .filter(([, color]) => !aliasValues.some((alias) => isDeepStrictEqual(alias, color)))
      .map(([name]) => name);

    expect(invented).toEqual([]);
  });

  it('takes shadows, font variants and spacing from Fluent 2 and global tokens', () => {
    expect(theme.shadows).toEqual(shadows);
    expect(theme.typography.variants).toBe(fontAliasTokens);
    expect(theme.spacing).toEqual({ s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' });
  });

  it('defines every key the legacy default theme defines, with no undefined values', () => {
    const legacy = getDefaultLegacyTheme({ colorScheme: appearance, contrast: 'standard', interfaceLevel: 'base' });
    const missing = [
      ...Object.keys(legacy.colors).filter((key) => !(key in theme.colors)),
      ...Object.keys(legacy.shadows).filter((key) => !(key in theme.shadows)),
      ...Object.keys(legacy.typography.families).filter((key) => !(key in theme.typography.families)),
      ...Object.keys(legacy.typography.sizes).filter((key) => !(key in theme.typography.sizes)),
      ...Object.keys(legacy.typography.variants).filter((key) => !(key in theme.typography.variants)),
      ...Object.keys(legacy.spacing).filter((key) => !(key in theme.spacing)),
    ];

    expect(missing).toEqual([]);
    expect(undefinedPaths(theme)).toEqual([]);
  });
});

describe('fluentTheme', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves the theme for the requested color scheme, including high contrast and elevated requests', () => {
    expect(fluentTheme.resolveTheme({ colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' }).colors).toBe(
      fluentLightTheme.colors,
    );
    expect(fluentTheme.resolveTheme({ colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'base' }).colors).toBe(
      fluentDarkTheme.colors,
    );
    expect(fluentTheme.resolveTheme({ colorScheme: 'dark', contrast: 'highContrast', interfaceLevel: 'elevated' }).host.appearance).toBe(
      'dark',
    );
  });

  it('follows the system color scheme from the Appearance module', () => {
    const colorScheme = jest.spyOn(Appearance, 'getColorScheme');

    colorScheme.mockReturnValue('dark');
    expect(fluentTheme.theme).toBe(fluentDarkTheme);
    colorScheme.mockReturnValue('light');
    expect(fluentTheme.theme).toBe(fluentLightTheme);
  });

  it('drives a ThemeProvider from the system appearance until an appearance prop overrides it', () => {
    const appearance = createAppearanceSource({ colorScheme: 'light' });
    const seen: Theme[] = [];
    const render = (appearanceProp?: { colorScheme: 'light' | 'dark' }) => (
      <ThemeProvider theme={fluentTheme} appearanceSource={appearance.source} appearance={appearanceProp}>
        <ThemeProbe themes={seen} />
      </ThemeProvider>
    );
    let component!: ReturnType<typeof create>;

    act(() => {
      component = create(render());
    });
    expect(seen.at(-1)?.colors).toBe(fluentLightTheme.colors);

    act(() => appearance.update({ colorScheme: 'dark' }));
    expect(seen.at(-1)?.colors).toBe(fluentDarkTheme.colors);

    act(() => component.update(render({ colorScheme: 'light' })));
    expect(seen.at(-1)?.colors).toBe(fluentLightTheme.colors);

    act(() => component.unmount());
  });

  it('feeds Flex consumers under a ThemedRoot from its alias colors', () => {
    const appearance = createAppearanceSource({ colorScheme: 'dark' });
    const seen: unknown[] = [];
    const Probe = () => {
      seen.push(useThemeState().tokens.color.foregroundNeutralPrimary.rest);
      return null;
    };
    let component!: ReturnType<typeof create>;

    act(() => {
      component = create(
        <ThemedRoot theme={fluentTheme} appearanceSource={appearance.source}>
          <Probe />
        </ThemedRoot>,
      );
    });
    expect(seen.at(-1)).toBe(darkAliasColors.neutralForeground1);

    act(() => appearance.update({ colorScheme: 'light' }));
    expect(seen.at(-1)).toBe(lightAliasColors.neutralForeground1);

    act(() => component.unmount());
  });
});
