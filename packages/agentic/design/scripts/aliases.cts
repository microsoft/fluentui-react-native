const assert = require('node:assert/strict');
const path = require('node:path');
const { CodegenFile } = require('@fluentui-react-native/scripts');

const desktopMappers = require('../src/theming/mapPipelineToTheme.ts');
const androidMappers = require('../src/theming/mapPipelineToTheme.android.ts');
const iosMappers = require('../src/theming/mapPipelineToTheme.ios.ts');

const iosLightAliases = require('@fluentui-react-native/design-tokens-ios/light/tokens-aliases.json');
const iosDarkAliases = require('@fluentui-react-native/design-tokens-ios/dark/tokens-aliases.json');

const aliasJson = {
  win32: {
    light: require('@fluentui-react-native/design-tokens-win32/colorful/tokens-aliases.json'),
    dark: require('@fluentui-react-native/design-tokens-win32/black/tokens-aliases.json'),
    darkGray: require('@fluentui-react-native/design-tokens-win32/darkgray/tokens-aliases.json'),
    hc: require('@fluentui-react-native/design-tokens-win32/hc/tokens-aliases.json'),
  },
  macos: {
    light: require('@fluentui-react-native/design-tokens-macos/light/tokens-aliases.json'),
    dark: require('@fluentui-react-native/design-tokens-macos/dark/tokens-aliases.json'),
    hclight: require('@fluentui-react-native/design-tokens-macos/hclight/tokens-aliases.json'),
    hcdark: require('@fluentui-react-native/design-tokens-macos/hcdark/tokens-aliases.json'),
  },
  ios: {
    light: iosLightAliases,
    dark: iosDarkAliases,
    elevateddark: require('@fluentui-react-native/design-tokens-ios/elevateddark/tokens-aliases.json'),
    // iOS high-contrast aliases contain typography only; its semantic colors come from the matching base appearance.
    hclight: { ...iosLightAliases, ...require('@fluentui-react-native/design-tokens-ios/hclight/tokens-aliases.json') },
    hcdark: { ...iosDarkAliases, ...require('@fluentui-react-native/design-tokens-ios/hcdark/tokens-aliases.json') },
  },
  android: {
    light: require('@fluentui-react-native/design-tokens-android/light/tokens-aliases.json'),
    dark: require('@fluentui-react-native/design-tokens-android/dark/tokens-aliases.json'),
  },
};

const platformMappers = {
  win32: desktopMappers,
  macos: desktopMappers,
  ios: iosMappers,
  android: androidMappers,
};

const platformColorPattern = /^PlatformColor\(([^)]+)\)$/;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function literal(value: unknown) {
  if (value === undefined) {
    return 'undefined';
  }
  return JSON.stringify(value);
}

function colorExpression(codegenFile: any, value: unknown) {
  if (typeof value === 'string') {
    const platformColor = platformColorPattern.exec(value);
    if (platformColor) {
      const colorName = platformColor[1].replaceAll('\\', '\\\\').replaceAll("'", "\\'");
      return codegenFile.rampConstant('color', `PlatformColor('${colorName}')`);
    }
  }
  return codegenFile.rampConstant('color', literal(value));
}

function mappedPlatform(platform: string) {
  const themes = aliasJson[platform as keyof typeof aliasJson];
  const { mapPipelineToTheme, mapFontPipelineToTheme } = platformMappers[platform as keyof typeof platformMappers];
  return Object.fromEntries(
    Object.entries(themes).map(([theme, aliases]) => {
      const hasFonts = Object.values(aliases).some((value) => value && typeof value === 'object' && 'fontFamily' in value);
      return [
        theme,
        {
          colors: mapPipelineToTheme(aliases),
          fonts: hasFonts ? mapFontPipelineToTheme(aliases) : {},
        },
      ];
    }),
  );
}

function commonFonts(
  platform: string,
  mappedThemes: Record<string, { colors: Record<string, string>; fonts: Record<string, Record<string, string>> }>,
) {
  const themeEntries = Object.entries(mappedThemes);
  const [referenceTheme, reference] = themeEntries[0];
  for (const [theme, mapped] of themeEntries.slice(1)) {
    assert.deepStrictEqual(mapped.fonts, reference.fonts, `${platform} alias fonts differ between ${referenceTheme} and ${theme}`);
  }
  return reference.fonts;
}

function codegenAliases() {
  for (const platform of Object.keys(aliasJson)) {
    const mappedThemes = mappedPlatform(platform);
    const fonts = commonFonts(platform, mappedThemes);
    const usesPlatformColor = Object.values(mappedThemes).some(({ colors }) =>
      Object.values(colors).some((value) => typeof value === 'string' && platformColorPattern.test(value)),
    );
    const filename = platform === 'win32' ? 'aliases.ts' : `aliases.${platform}.ts`;
    const filePath = path.join(__dirname, '../src/tokens/generated', filename);
    const codegenFile = new CodegenFile(filePath);

    if (usesPlatformColor) {
      codegenFile.header += `\n\nimport { PlatformColor } from 'react-native';`;
    }
    codegenFile.header += `\nimport type { AliasColorTokens } from '../../theming/types/Color.types';`;
    if (Object.keys(fonts).length > 0) {
      codegenFile.header += `\nimport type { VariantValue } from '../../theming/types/Typography.types';`;
    }

    for (const [theme, { colors }] of Object.entries(mappedThemes)) {
      const colorObject = codegenFile.addObject('aliasColors', `${theme}AliasColors`, capitalize(theme), false, 'AliasColorTokens');
      for (const [key, value] of Object.entries(colors)) {
        colorObject.addValue(key, colorExpression(codegenFile, value));
      }
    }

    for (const [font, value] of Object.entries(fonts)) {
      const name = `font${capitalize(font)}`;
      const fontObject = codegenFile.addObject(name, name, capitalize(font), false, 'VariantValue');
      for (const [key, fontValue] of Object.entries(value)) {
        if (key === 'face') {
          const faceValue = codegenFile.rampString('fontFace', fontValue);
          fontObject.addValue(key, faceValue);
        } else if (key === 'weight' && typeof fontValue === 'string') {
          const weightValue = codegenFile.rampString('fontWeight', fontValue);
          fontObject.addValue(key, weightValue);
        } else {
          fontObject.addValue(key, literal(fontValue));
        }
      }
    }

    codegenFile.finish();
  }
}

module.exports = {
  codegenAliases,
};
