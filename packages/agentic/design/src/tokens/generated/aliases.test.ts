import * as androidAliases from '@fluentui-react-native/design/tokens/generated/aliases.android';
import * as iosAliases from '@fluentui-react-native/design/tokens/generated/aliases.ios';
import * as macosAliases from '@fluentui-react-native/design/tokens/generated/aliases.macos';
import * as win32Aliases from '@fluentui-react-native/design/tokens/generated/aliases';
import androidDark from '@fluentui-react-native/design-tokens-android/dark/tokens-aliases.json';
import androidLight from '@fluentui-react-native/design-tokens-android/light/tokens-aliases.json';
import iosDark from '@fluentui-react-native/design-tokens-ios/dark/tokens-aliases.json';
import iosElevatedDark from '@fluentui-react-native/design-tokens-ios/elevateddark/tokens-aliases.json';
import iosHcDark from '@fluentui-react-native/design-tokens-ios/hcdark/tokens-aliases.json';
import iosHcLight from '@fluentui-react-native/design-tokens-ios/hclight/tokens-aliases.json';
import iosLight from '@fluentui-react-native/design-tokens-ios/light/tokens-aliases.json';
import macosDark from '@fluentui-react-native/design-tokens-macos/dark/tokens-aliases.json';
import macosHcDark from '@fluentui-react-native/design-tokens-macos/hcdark/tokens-aliases.json';
import macosHcLight from '@fluentui-react-native/design-tokens-macos/hclight/tokens-aliases.json';
import macosLight from '@fluentui-react-native/design-tokens-macos/light/tokens-aliases.json';
import win32Dark from '@fluentui-react-native/design-tokens-win32/black/tokens-aliases.json';
import win32DarkGray from '@fluentui-react-native/design-tokens-win32/darkgray/tokens-aliases.json';
import win32Hc from '@fluentui-react-native/design-tokens-win32/hc/tokens-aliases.json';
import win32Light from '@fluentui-react-native/design-tokens-win32/colorful/tokens-aliases.json';

import {
  mapFontPipelineToTheme as mapAndroidFonts,
  mapPipelineToTheme as mapAndroidColors,
} from '../../theming/mapPipelineToTheme.android';
import { mapFontPipelineToTheme as mapIosFonts, mapPipelineToTheme as mapIosColors } from '../../theming/mapPipelineToTheme.ios';
import { mapFontPipelineToTheme as mapDesktopFonts, mapPipelineToTheme as mapDesktopColors } from '../../theming/mapPipelineToTheme';

jest.mock('react-native', () => ({
  PlatformColor: (color: string) => `PlatformColor(${color})`,
}));

type GeneratedAliases = Record<string, unknown>;
type Mapper = (aliases: unknown) => object;

function generatedFonts(generated: GeneratedAliases): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(generated)
      .filter(([name]) => name.startsWith('font'))
      .map(([name, value]) => [name.charAt(4).toLowerCase() + name.slice(5), value]),
  );
}

function verifyGeneratedAliases(
  generated: GeneratedAliases,
  themes: Record<string, unknown>,
  mapColors: Mapper,
  mapFonts?: Mapper,
): void {
  for (const [theme, aliases] of Object.entries(themes)) {
    expect(generated[`${theme}AliasColors`]).toEqual(mapColors(aliases));
  }

  const firstTheme = Object.values(themes)[0];
  expect(generatedFonts(generated)).toEqual(mapFonts ? mapFonts(firstTheme) : {});
}

it('generates Win32 aliases and shared fonts', () => {
  verifyGeneratedAliases(
    win32Aliases,
    { light: win32Light, dark: win32Dark, darkGray: win32DarkGray, hc: win32Hc },
    mapDesktopColors,
    mapDesktopFonts,
  );
});

it('generates macOS aliases', () => {
  verifyGeneratedAliases(
    macosAliases,
    { light: macosLight, dark: macosDark, hclight: macosHcLight, hcdark: macosHcDark },
    mapDesktopColors,
  );
});

it('generates iOS aliases and shared fonts', () => {
  verifyGeneratedAliases(
    iosAliases,
    {
      light: iosLight,
      dark: iosDark,
      elevateddark: iosElevatedDark,
      hclight: { ...iosLight, ...iosHcLight },
      hcdark: { ...iosDark, ...iosHcDark },
    },
    mapIosColors,
    mapIosFonts,
  );
});

it('generates Android aliases and shared fonts', () => {
  verifyGeneratedAliases(androidAliases, { light: androidLight, dark: androidDark }, mapAndroidColors, mapAndroidFonts);
});
