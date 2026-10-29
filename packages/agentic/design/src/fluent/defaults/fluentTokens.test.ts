import { readFileSync } from 'node:fs';
import path from 'node:path';

import { parse } from '@babel/parser';
import blackAliasTokens from '@fluentui-react-native/design-tokens-win32/black/tokens-aliases.json';
import blackShadowTokens from '@fluentui-react-native/design-tokens-win32/black/tokens-shadow.json';
import colorfulAliasTokens from '@fluentui-react-native/design-tokens-win32/colorful/tokens-aliases.json';
import colorfulShadowTokens from '@fluentui-react-native/design-tokens-win32/colorful/tokens-shadow.json';
import darkGrayAliasTokens from '@fluentui-react-native/design-tokens-win32/darkgray/tokens-aliases.json';
import darkGrayShadowTokens from '@fluentui-react-native/design-tokens-win32/darkgray/tokens-shadow.json';
import hcAliasTokens from '@fluentui-react-native/design-tokens-win32/hc/tokens-aliases.json';
import hcShadowTokens from '@fluentui-react-native/design-tokens-win32/hc/tokens-shadow.json';
import { PlatformColor } from 'react-native';

import { mapPipelineToShadow } from '../mapPipelineToShadow';
import { mapFontPipelineToTheme, mapPipelineToTheme } from '../mapPipelineToTheme';
import * as androidMapper from '../mapPipelineToTheme.android';
import * as iosMapper from '../mapPipelineToTheme.ios';
import { processAliasTokens, transformWin32PlatformColorName } from '../tokens/highContrast/processAliasTokens';
import * as android from './fluentTokens.generated.android';
import * as ios from './fluentTokens.generated.ios';
import * as macos from './fluentTokens.generated.macos';
import * as windows from './fluentTokens.generated.windows';

// An explicit extension bypasses Jest's platform resolution for the Win32 fallback module.
const generated = jest.requireActual<typeof macos>('./fluentTokens.generated.ts');

function definedEntries(values: object) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
}

// processAliasTokens converts the high-contrast PlatformColor strings in place, so it gets a copy.
const processedHcAliasTokens = processAliasTokens(JSON.parse(JSON.stringify(hcAliasTokens)), transformWin32PlatformColorName);

const appearances = [
  ['light', generated.lightAliasColors, generated.lightShadows, colorfulAliasTokens, colorfulShadowTokens],
  ['dark', generated.darkAliasColors, generated.darkShadows, blackAliasTokens, blackShadowTokens],
  ['darkGray', generated.darkGrayAliasColors, generated.darkGrayShadows, darkGrayAliasTokens, darkGrayShadowTokens],
  ['hc', generated.hcAliasColors, generated.hcShadows, processedHcAliasTokens, hcShadowTokens],
] as const;

describe('generated win32 Fluent tokens', () => {
  it.each(appearances)('match the runtime mapping for %s', (_, aliasColors, shadows, aliasTokens, shadowTokens) => {
    expect(aliasColors).toMatchObject(definedEntries(mapPipelineToTheme(aliasTokens)));
    expect(shadows).toEqual(mapPipelineToShadow(shadowTokens));
  });

  it('match the runtime font mapping', () => {
    expect(generated.fontAliasTokens).toMatchObject(mapFontPipelineToTheme(colorfulAliasTokens));
  });

  it('emit high-contrast colors as distinct PlatformColor values', () => {
    expect(generated.hcAliasColors.neutralForeground1).toEqual(PlatformColor('WindowText'));
    expect(PlatformColor('WindowText')).not.toEqual(PlatformColor('ButtonFace'));
  });
});

function interfaceKeys(filename: string, name: string): string[] {
  const ast = parse(readFileSync(path.resolve(__dirname, '../types', filename), 'utf8'), { sourceType: 'module', plugins: ['typescript'] });
  for (const statement of ast.program.body) {
    const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : undefined;
    if (declaration?.type === 'TSInterfaceDeclaration' && declaration.id.name === name) {
      return declaration.body.body
        .map((property) => {
          if (property.type !== 'TSPropertySignature' || property.key.type !== 'Identifier') {
            throw new Error(`Unsupported property in ${name}`);
          }
          return property.key.name;
        })
        .sort();
    }
  }
  throw new Error(`Missing interface ${name}`);
}

function expectDefined(value: unknown): void {
  expect(value).not.toBeUndefined();
  expect(value).not.toBeNull();
  if (value && typeof value === 'object') {
    Object.values(value).forEach(expectDefined);
  }
}

const allAppearances = ['light', 'dark', 'darkGray', 'hc', 'hcLight', 'hcDark', 'darkElevated'] as const;
const platforms = [
  {
    platform: 'win32',
    tokens: generated,
    mapper: { mapPipelineToTheme, mapFontPipelineToTheme },
    sources: { light: 'colorful', dark: 'black', darkGray: 'darkgray', hc: 'hc' },
  },
  {
    platform: 'macos',
    tokens: macos,
    mapper: { mapPipelineToTheme, mapFontPipelineToTheme },
    sources: { light: 'light', dark: 'dark', hcLight: 'hclight', hcDark: 'hcdark' },
  },
  {
    platform: 'windows',
    tokens: windows,
    mapper: { mapPipelineToTheme, mapFontPipelineToTheme },
    sources: { light: 'light', dark: 'dark' },
  },
  { platform: 'android', tokens: android, mapper: androidMapper, sources: { light: 'light', dark: 'dark' } },
  {
    platform: 'ios',
    tokens: ios,
    mapper: iosMapper,
    sources: { light: 'light', dark: 'dark', hcLight: 'hclight', hcDark: 'hcdark', darkElevated: 'elevateddark' },
  },
] as const;

describe.each(platforms)('complete $platform Fluent tokens', ({ platform, tokens, mapper, sources }) => {
  it('covers the entire color and font contracts in every appearance with no undefined values', () => {
    const colorKeys = interfaceKeys('Color.types.ts', 'AliasColorTokens');
    const fontKeys = interfaceKeys('Typography.types.ts', 'Variants');
    const shadowKeys = interfaceKeys('Shadow.types.ts', 'BaseShadowAliasTokens');
    expect(Object.keys(tokens).sort()).toEqual(
      ['fontAliasTokens', ...allAppearances.flatMap((appearance) => [`${appearance}AliasColors`, `${appearance}Shadows`])].sort(),
    );
    expect(Object.keys(tokens.fontAliasTokens).sort()).toEqual(fontKeys);
    for (const appearance of allAppearances) {
      expect(Object.keys(tokens[`${appearance}AliasColors`]).sort()).toEqual(colorKeys);
      expect(Object.keys(tokens[`${appearance}Shadows`]).sort()).toEqual(shadowKeys);
    }
    expectDefined(tokens);
  });

  it('preserves every defined runtime-mapped native color, font alias, and shadow', () => {
    for (const [appearance, source] of Object.entries(sources)) {
      const packagePath = `@fluentui-react-native/design-tokens-${platform}/${source}/`;
      const raw = require(`${packagePath}tokens-aliases.json`);
      const aliases = processAliasTokens(JSON.parse(JSON.stringify(raw)), transformWin32PlatformColorName);
      const shadows = require(`${packagePath}tokens-shadow.json`);
      const key = appearance as (typeof allAppearances)[number];
      // iOS high-contrast files contain fonts only, with no native colors to preserve.
      if (aliases.neutralBackground1) {
        expect(tokens[`${key}AliasColors`]).toMatchObject(definedEntries(mapper.mapPipelineToTheme(aliases)));
      }
      if (aliases.caption1) {
        expect(tokens.fontAliasTokens).toMatchObject(mapper.mapFontPipelineToTheme(aliases));
      }
      expect(tokens[`${key}Shadows`]).toEqual(mapPipelineToShadow(shadows));
    }
  });
});

describe('Fluent token fallbacks', () => {
  it.each([ios, android])('uses native rest colors and native fonts for missing mobile states and aliases', (tokens) => {
    expect(tokens.darkAliasColors.brandBackground2).toBe(tokens.darkAliasColors.brandBackground);
    expect(tokens.darkAliasColors.brandBackground2Pressed).toBe(tokens.darkAliasColors.brandBackgroundPressed);
    expect(tokens.lightAliasColors.neutralBackground1Hover).toBe(tokens.lightAliasColors.neutralBackground1);
    expect(tokens.lightAliasColors.neutralForegroundOnBrand).toBe(tokens.lightAliasColors.neutralForegroundOnColor);
    expect(tokens.fontAliasTokens.subtitle1).toEqual(tokens.fontAliasTokens.title2);
    expect(tokens.fontAliasTokens.subtitle2).toEqual(tokens.fontAliasTokens.title3);
    expect(tokens.lightAliasColors.outofofficeBackground3).toBe(generated.lightAliasColors.outofofficeBackground3);
    expect(tokens.darkAliasColors.outofofficeBackground3).toBe(generated.darkAliasColors.outofofficeBackground3);
  });

  it('inherits missing appearances without importing Win32 system colors onto other platforms', () => {
    expect(ios.hcLightAliasColors).toEqual(ios.lightAliasColors);
    expect(ios.hcDarkAliasColors).toEqual(ios.darkAliasColors);
    expect(generated.hcLightAliasColors).toEqual(generated.hcAliasColors);
    expect(generated.hcDarkAliasColors).toEqual(generated.hcAliasColors);
    for (const { tokens } of platforms.filter(({ platform }) => platform !== 'win32')) {
      expect(tokens.darkGrayAliasColors).toEqual(tokens.darkAliasColors);
      expect(tokens.darkGrayShadows).toEqual(tokens.darkShadows);
      for (const appearance of allAppearances) {
        expect(Object.values(tokens[`${appearance}AliasColors`]).every((color) => typeof color === 'string')).toBe(true);
      }
    }
  });

  it.each([
    ['macos', macos],
    ['windows', windows],
  ] as const)('uses %s global fonts when the pipeline has no aliases', (platform, tokens) => {
    const { font } = require(`@fluentui-react-native/design-tokens-${platform}/light/tokens-global.json`);
    expect(tokens.fontAliasTokens.caption1).toEqual({ face: 'primary', size: font.size100, weight: font.weight.regular });
    expect(tokens.fontAliasTokens.body1Strong).toEqual({ face: 'primary', size: font.size200, weight: font.weight.semibold });
  });

  it('keeps native states omitted by the legacy mapper and aliases deprecated colors', () => {
    const source = require('@fluentui-react-native/design-tokens-macos/light/tokens-aliases.json');
    expect(macos.lightAliasColors.brandForeground1Selected).toBe(source.brandForeground1.selected);
    expect(macos.lightAliasColors.brandStroke1Pressed).toBe(source.brandStroke1.pressed);
    expect(ios.darkAliasColors.redForeground1).toBe(ios.darkAliasColors.dangerForeground1);
  });
});
