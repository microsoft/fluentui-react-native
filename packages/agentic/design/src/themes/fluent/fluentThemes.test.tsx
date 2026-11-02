import { isDeepStrictEqual } from 'node:util';

import { Appearance } from 'react-native';

import { act, create } from 'react-test-renderer';

import {
  darkAliasColors,
  darkShadows,
  fontAliasTokens,
  hcDarkAliasColors,
  hcDarkShadows,
  hcLightAliasColors,
  hcLightShadows,
  lightAliasColors,
  lightShadows,
} from '../../fluent/defaults/fluentTokens.generated';
import type { Theme } from '../../fluent/types/Theme.types';
import { useTheme } from '../../fluent/useTheme';
import { useThemeState } from '../../flex/useThemeState';
import { ThemedRoot } from '../../theming/ThemedRoot';
import { ThemeProvider } from '../../theming/ThemeProvider';
import type { ResolvedThemeAppearance, ThemeAppearanceSource, ThemeAppearanceSourceSnapshot } from '../../types/appearance.types';
import { fluentDarkTheme, fluentHcTheme, fluentLightTheme, fluentTheme } from '../index';
import { fluentHcDarkTheme } from './fluentHcDarkTheme';
import { fluentHcLightTheme } from './fluentHcLightTheme';
import { selectFluentTheme } from './selectFluentTheme';

const standardLight = { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' } as const;
const standardDark = { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'base' } as const;
const hcLight = { colorScheme: 'light', contrast: 'highContrast', interfaceLevel: 'base' } as const;
const hcDark = { colorScheme: 'dark', contrast: 'highContrast', interfaceLevel: 'base' } as const;

const themes = [
  ['light', fluentLightTheme, lightAliasColors, lightShadows, 'light', standardLight],
  ['dark', fluentDarkTheme, darkAliasColors, darkShadows, 'dark', standardDark],
  ['high-contrast light', fluentHcLightTheme, hcLightAliasColors, hcLightShadows, 'highContrast', hcLight],
  ['high-contrast dark', fluentHcDarkTheme, hcDarkAliasColors, hcDarkShadows, 'highContrast', hcDark],
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

describe.each(themes)('Fluent %s theme', (_name, theme, aliasColors, shadows, hostAppearance, appearance) => {
  it('carries every Fluent 2 alias color unchanged for its host appearance', () => {
    expect(theme.host.appearance).toBe(hostAppearance);
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

  it('defines no undefined values', () => {
    expect(undefinedPaths(theme)).toEqual([]);
  });

  it('is the Fluent theme selected for its appearance', () => {
    expect(selectFluentTheme(appearance)).toBe(theme);
    expect(selectFluentTheme({ ...appearance, interfaceLevel: 'elevated' })).toBe(theme);
  });
});

describe('fluentTheme', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    [standardLight, fluentLightTheme],
    [standardDark, fluentDarkTheme],
    [{ ...standardDark, interfaceLevel: 'elevated' }, fluentDarkTheme],
    [hcLight, fluentHcLightTheme],
    [hcDark, fluentHcDarkTheme],
    [{ ...hcDark, interfaceLevel: 'elevated' }, fluentHcDarkTheme],
  ] as [ResolvedThemeAppearance, Theme][])('resolves %o by contrast and color scheme', (appearance, theme) => {
    expect(fluentTheme.resolveTheme(appearance).colors).toBe(theme.colors);
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

    act(() => appearance.update({ colorScheme: 'dark', contrast: 'highContrast' }));
    expect(seen.at(-1)?.colors).toBe(fluentHcDarkTheme.colors);

    act(() => component.update(render({ colorScheme: 'light' })));
    expect(seen.at(-1)?.colors).toBe(fluentHcLightTheme.colors);

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

describe('fluentHcTheme', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves the high-contrast theme for the color scheme, whatever contrast is requested', () => {
    expect(fluentHcTheme.resolveTheme(standardLight).colors).toBe(fluentHcLightTheme.colors);
    expect(fluentHcTheme.resolveTheme(hcDark).colors).toBe(fluentHcDarkTheme.colors);
  });

  it('follows the system color scheme from the Appearance module', () => {
    const colorScheme = jest.spyOn(Appearance, 'getColorScheme');

    colorScheme.mockReturnValue('dark');
    expect(fluentHcTheme.theme).toBe(fluentHcDarkTheme);
    colorScheme.mockReturnValue('light');
    expect(fluentHcTheme.theme).toBe(fluentHcLightTheme);
  });
});
