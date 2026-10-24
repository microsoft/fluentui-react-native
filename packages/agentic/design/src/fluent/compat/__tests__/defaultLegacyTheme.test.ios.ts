import { getDefaultLegacyTheme } from '../defaultLegacyTheme';

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

it('uses elevated-dark iOS aliases for the legacy compatibility base', () => {
  const darkTheme = getDefaultLegacyTheme(dark);
  const elevatedTheme = getDefaultLegacyTheme(darkElevated);

  expect(elevatedTheme.colors.neutralBackground4).toBe('#424242');
  expect(elevatedTheme.colors.neutralBackground4).not.toBe(darkTheme.colors.neutralBackground4);
});
