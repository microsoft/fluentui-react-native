import type { GeneratedAppearanceName } from '../../tokens/generated/appearanceNames';
import { resolveGeneratedValue } from '../../tokens/generated/resolveGeneratedValue';
import type { GeneratedValueDefinitions } from '../../tokens/generated/types';
import { generatedLegacyTokenDefinitions as win32Definitions } from '../../tokens/legacy/generated/tokenSets.win32';
import { generatedLegacyTokenDefinitions as windowsDefinitions } from '../../tokens/legacy/generated/tokenSets.windowsSource';
import type { GeneratedLegacyTokenSet } from '../../tokens/legacy/generatedTokenSet.types';
import { getCurrentAppearance } from '../';
import { mapPipelineToShadow } from '../mapPipelineToShadow';
import { mapPipelineToTheme, mapFontPipelineToTheme } from '../mapPipelineToTheme';

const fallBackAppearance = 'light';
const windowsCache = new Map<GeneratedAppearanceName, GeneratedLegacyTokenSet>();
const win32Cache = new Map<GeneratedAppearanceName, GeneratedLegacyTokenSet>();

function getTokenSet(
  definitions: GeneratedValueDefinitions<GeneratedLegacyTokenSet, GeneratedAppearanceName>,
  cache: Map<GeneratedAppearanceName, GeneratedLegacyTokenSet>,
  appearance: GeneratedAppearanceName,
) {
  return resolveGeneratedValue<GeneratedLegacyTokenSet, GeneratedAppearanceName>(definitions, appearance, cache);
}

beforeAll(() => {
  jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
    getColorScheme: () => 'dark',
  }));
});

describe('getCurrentAppearanceTable test', () => {
  it('light', () => {
    expect(getCurrentAppearance('light', fallBackAppearance)).toBe('light');
  });

  it('dark', () => {
    expect(getCurrentAppearance('dark', fallBackAppearance)).toBe('dark');
  });

  it('highContrast', () => {
    expect(getCurrentAppearance('highContrast', fallBackAppearance)).toBe('highContrast');
  });

  it('dynamic', () => {
    expect(getCurrentAppearance('dynamic', fallBackAppearance)).toBe('dark');
  });

  it('undefined', () => {
    expect(getCurrentAppearance(undefined, fallBackAppearance)).toBe(fallBackAppearance);
  });
});

describe('mapPipelineToTheme test', () => {
  it('lightAliasTokens', () => {
    const aliasColorTokens = mapPipelineToTheme(getTokenSet(windowsDefinitions, windowsCache, 'light').aliases);
    expect(aliasColorTokens).toMatchSnapshot();
  });

  it('darkAliasTokens', () => {
    const aliasColorTokens = mapPipelineToTheme(getTokenSet(windowsDefinitions, windowsCache, 'dark').aliases);
    expect(aliasColorTokens).toMatchSnapshot();
  });
});

describe('mapFontPipelineToTheme test', () => {
  it('colorfulAliasTokens', () => {
    const fontTheme = mapFontPipelineToTheme(getTokenSet(win32Definitions, win32Cache, 'light').aliases);
    expect(fontTheme).toMatchSnapshot();
  });

  it('darkGrayAliasTokens', () => {
    const fontTheme = mapFontPipelineToTheme(getTokenSet(win32Definitions, win32Cache, 'darkElevated').aliases);
    expect(fontTheme).toMatchSnapshot();
  });

  it('blackAliasTokens', () => {
    const fontTheme = mapFontPipelineToTheme(getTokenSet(win32Definitions, win32Cache, 'dark').aliases);
    expect(fontTheme).toMatchSnapshot();
  });
});

describe('mapPipelineToShadow test', () => {
  it('lightShadowTokens', () => {
    const fontTheme = mapPipelineToShadow(getTokenSet(windowsDefinitions, windowsCache, 'light').shadows);
    expect(fontTheme).toMatchSnapshot();
  });

  it('darkShadowTokens', () => {
    const fontTheme = mapPipelineToShadow(getTokenSet(windowsDefinitions, windowsCache, 'dark').shadows);
    expect(fontTheme).toMatchSnapshot();
  });

  it('hcShadowTokens', () => {
    const fontTheme = mapPipelineToShadow(getTokenSet(win32Definitions, win32Cache, 'lightHighContrast').shadows);
    expect(fontTheme).toMatchSnapshot();
  });
});
