import { getDefaultLegacyTheme } from './defaultLegacyTheme';

const light = {
  colorScheme: 'light',
  contrast: 'standard',
  interfaceLevel: 'base',
} as const;
const dark = {
  colorScheme: 'dark',
  contrast: 'standard',
  interfaceLevel: 'base',
} as const;
const darkElevated = {
  colorScheme: 'dark',
  contrast: 'standard',
  interfaceLevel: 'elevated',
} as const;
const highContrast = {
  colorScheme: 'dark',
  contrast: 'highContrast',
  interfaceLevel: 'base',
} as const;

describe('getDefaultLegacyTheme', () => {
  it('creates complete stable legacy bases lazily per resolved appearance', () => {
    const lightTheme = getDefaultLegacyTheme(light);
    const darkTheme = getDefaultLegacyTheme(dark);

    expect(getDefaultLegacyTheme(light)).toBe(lightTheme);
    expect(getDefaultLegacyTheme(dark)).toBe(darkTheme);
    expect(darkTheme).not.toBe(lightTheme);

    for (const theme of [lightTheme, darkTheme]) {
      expect(theme.colors.background).toBeDefined();
      expect(theme.colors.bodyText).toBeDefined();
      expect(theme.colors.disabledText).toBeDefined();
      expect(theme.colors.inputBackground).toBeDefined();
      expect(theme.colors.buttonBackground).toBeDefined();
      expect(theme.colors.primaryButtonBackground).toBeDefined();
      expect(theme.colors.menuBackground).toBeDefined();
      expect(theme.colors.link).toBeDefined();
      expect(theme.typography.families.primary).toBeDefined();
      expect(theme.typography.sizes.body).toBeDefined();
      expect(theme.typography.weights.regular).toBeDefined();
      expect(theme.typography.variants.bodyStandard).toBeDefined();
      expect(theme.shadows.shadow2).toBeDefined();
      expect(theme.shadows.shadow64).toBeDefined();
      expect(theme.spacing.s1).toBeDefined();
      expect(theme.components).toEqual({});
    }
  });

  it('preserves elevated-dark and high-contrast compatibility appearances', () => {
    const elevatedTheme = getDefaultLegacyTheme(darkElevated);
    const highContrastTheme = getDefaultLegacyTheme(highContrast);

    expect(elevatedTheme.host.appearance).toBe('darkElevated');
    expect(elevatedTheme.colors.background).toBe(getDefaultLegacyTheme(dark).colors.background);
    expect(highContrastTheme.host.appearance).toBe('highContrast');
    expect(highContrastTheme.colors.background).toBe('#000000');
    expect(highContrastTheme.colors.bodyText).toBe('#ffffff');
  });
});
