import type { ValuePath } from '@fluentui-react-native/scripts';
import type { AliasColorTokens } from '../src/fluent/types/Color.types';
import type { Variants, VariantValue } from '../src/fluent/types/Typography.types';
const { GeneratedFile, ValuePool, expression, makeComment } = require('@fluentui-react-native/scripts');
const path = require('node:path');
const { mapPipelineToShadow } = require('../src/deprecated/mapPipelineToShadow.ts');

type Appearance = 'light' | 'dark' | 'lightElevated' | 'darkElevated' | 'hcLight' | 'hcDark';
type ColorKey = keyof AliasColorTokens;
type PipelineTokens = Record<string, Record<string, string | number>>;

type PlatformData = {
  /** Token package directory for each appearance the platform supplies. Light supplies the font aliases. */
  paths: Partial<Record<Appearance, string>> & { light: string; dark: string };
  /** Pipeline mapper module in src/deprecated for the platform. */
  mapper: string;
  filename: string;
  /** Native name for a pipeline `PlatformColor(Name)` system color. Defaults to the Win32 name. */
  platformColorName?: (name: string) => string;
};

const appearances: Appearance[] = ['light', 'dark', 'lightElevated', 'darkElevated', 'hcLight', 'hcDark'];

/** The color scheme of each appearance, which selects the base aliases and portable defaults beneath it. */
const appearanceSchemes: Record<Appearance, 'light' | 'dark'> = {
  light: 'light',
  dark: 'dark',
  lightElevated: 'light',
  darkElevated: 'dark',
  hcLight: 'light',
  hcDark: 'dark',
};

/**
 * Appearances to use, in order, when a platform has no token data for an appearance. A single high-contrast set
 * serves both color schemes; without one, high contrast uses the standard set for its scheme.
 */
const appearanceFallbacks: Record<Exclude<Appearance, 'light' | 'dark'>, Appearance[]> = {
  lightElevated: ['light'],
  darkElevated: ['dark'],
  hcLight: ['hcDark', 'light'],
  hcDark: ['hcLight', 'dark'],
};

const platformPaths: Record<string, PlatformData> = {
  win32: {
    paths: {
      light: '@fluentui-react-native/design-tokens-win32/colorful/',
      dark: '@fluentui-react-native/design-tokens-win32/black/',
      // Office Dark Gray serves as the elevated dark set, and the one high-contrast set of system colors as dark.
      darkElevated: '@fluentui-react-native/design-tokens-win32/darkgray/',
      hcDark: '@fluentui-react-native/design-tokens-win32/hc/',
    },
    mapper: 'mapPipelineToTheme.ts',
    filename: 'fluentTokens.generated.ts',
  },
  macos: {
    paths: {
      light: '@fluentui-react-native/design-tokens-macos/light/',
      dark: '@fluentui-react-native/design-tokens-macos/dark/',
      hcLight: '@fluentui-react-native/design-tokens-macos/hclight/',
      hcDark: '@fluentui-react-native/design-tokens-macos/hcdark/',
    },
    mapper: 'mapPipelineToTheme.ts',
    filename: 'fluentTokens.generated.macos.ts',
  },
  windows: {
    paths: {
      light: '@fluentui-react-native/design-tokens-windows/light/',
      dark: '@fluentui-react-native/design-tokens-windows/dark/',
      // Windows has no high-contrast set, so it uses the Win32 system colors as Windows brushes, as the legacy tokens do.
      hcDark: '@fluentui-react-native/design-tokens-win32/hc/',
    },
    platformColorName: (name) => `SystemColor${name}Color`,
    mapper: 'mapPipelineToTheme.ts',
    filename: 'fluentTokens.generated.windows.ts',
  },
  android: {
    paths: {
      light: '@fluentui-react-native/design-tokens-android/light/',
      dark: '@fluentui-react-native/design-tokens-android/dark/',
    },
    mapper: 'mapPipelineToTheme.android.ts',
    filename: 'fluentTokens.generated.android.ts',
  },
  ios: {
    paths: {
      light: '@fluentui-react-native/design-tokens-ios/light/',
      dark: '@fluentui-react-native/design-tokens-ios/dark/',
      hcLight: '@fluentui-react-native/design-tokens-ios/hclight/',
      hcDark: '@fluentui-react-native/design-tokens-ios/hcdark/',
      darkElevated: '@fluentui-react-native/design-tokens-ios/elevateddark/',
    },
    mapper: 'mapPipelineToTheme.ios.ts',
    filename: 'fluentTokens.generated.ios.ts',
  },
};

const colorEquivalents: Partial<Record<ColorKey, ColorKey[]>> = {
  neutralForeground4: ['neutralForeground3'],
  neutralForegroundDisabled: ['neutralForegroundDisabled1'],
  neutralForegroundDisabled1: ['neutralForegroundDisabled'],
  neutralForegroundDisabled2: ['neutralForegroundDisabled1'],
  neutralForegroundOnBrand: ['neutralForegroundOnColor'],
  neutralForegroundOnColor: ['neutralForegroundOnBrand'],
  neutralForegroundInverted: ['neutralForegroundOnColor'],
  neutralForegroundInvertedLink: ['neutralForegroundInverted'],
  brandForegroundLink: ['brandForeground1'],
  compoundBrandForeground1: ['brandForeground1'],
  brandForeground2: ['brandForeground1'],
  brandForegroundTint: ['brandForeground2'],
  brandForeground1Disabled: ['brandForegroundDisabled1', 'neutralForegroundDisabled'],
  brandForegroundDisabled1: ['brandForeground1Disabled', 'neutralForegroundDisabled1'],
  brandForegroundDisabled2: ['brandForegroundDisabled1'],
  neutralBackgroundCanvas: ['neutralBackground1'],
  neutralBackgroundLightStaticDisabled: ['neutralBackgroundDisabled'],
  brandBackground2: ['brandBackground'],
  brandBackground3: ['brandBackground2'],
  brandBackgroundTint: ['brandBackground2'],
  brandBackgroundInverted: ['neutralBackgroundInverted'],
  brandBackgroundInvertedDisabled: ['neutralBackgroundDisabled'],
  brandBackgroundDisabled: ['neutralBackgroundDisabled'],
  compoundBrandBackground1: ['brandBackground'],
  brandBackgroundStatic: ['brandBackground'],
  neutralStroke3: ['neutralStroke2'],
  neutralStrokeFocus1: ['strokeFocus1'],
  neutralStrokeFocus2: ['strokeFocus2'],
  strokeFocus1: ['neutralStrokeFocus1'],
  strokeFocus2: ['neutralStrokeFocus2'],
  brandStroke2: ['brandStrokeTint', 'brandStroke1'],
  brandStrokeTint: ['brandStroke2'],
  compoundBrandStroke1: ['brandStroke1'],
  dangerStroke1: ['dangerBorder1', 'dangerForeground1'],
  successStroke1: ['successBorder1', 'successForeground1'],
  warningStroke1: ['warningBorder1', 'warningForeground1'],
  severeStroke1: ['severeBorder1', 'severeForeground1'],
  dangerBorder1: ['dangerStroke1'],
  successBorder1: ['successStroke1'],
  warningBorder1: ['warningStroke1'],
  severeBorder1: ['severeStroke1'],
  presenceAway: ['warningForeground1'],
  presenceDnd: ['dangerForeground1'],
  presenceAvailable: ['successForeground1'],
  presenceOof: ['outofofficeForeground1'],
  redBackground1: ['dangerBackground1'],
  redBackground2: ['dangerBackground2'],
  redBackground3: ['dangerBackground3'],
  redForeground1: ['dangerForeground1'],
  redForeground2: ['dangerForeground2'],
  redForeground3: ['dangerForeground3'],
  redBorderActive: ['dangerBorderActive'],
  redBorder1: ['dangerBorder1'],
  redBorder2: ['dangerBorder2'],
};

function colorCandidates(key: ColorKey): ColorKey[] {
  if (colorEquivalents[key]) {
    return colorEquivalents[key];
  }
  const state = /(?:Brand)?(?:Hover|Pressed|Selected|Disabled)$/.exec(key);
  if (!state) {
    return [];
  }
  const rest = key.slice(0, state.index) as ColorKey;
  return [...(colorEquivalents[rest] ?? []).map((candidate) => (candidate + state[0]) as ColorKey), rest];
}

function definedEntries<T>(values: Record<string, T | undefined>): Record<string, T> {
  return Object.fromEntries(Object.entries(values).filter((entry): entry is [string, T] => entry[1] !== undefined));
}

function mapColors(tokens: PipelineTokens, mapper: string, keys?: Set<ColorKey>): Record<string, string> {
  const { mapPipelineToTheme } = require(`../src/deprecated/${mapper}`);
  const colors = definedEntries<string>(mapPipelineToTheme(tokens));
  // Keep native states that a legacy mapper omits, but do not add keys outside the alias contract.
  if (keys) {
    for (const [token, states] of Object.entries(tokens)) {
      if (!('rest' in states)) {
        continue;
      }
      const name = token === 'brandBackground1' ? 'brandBackground' : token;
      for (const [state, value] of Object.entries(states)) {
        const key = (
          state === 'rest'
            ? name
            : name === 'transparentStroke' && state === 'hover'
              ? 'transparentStrokeInteractive'
              : name + state[0].toUpperCase() + state.slice(1)
        ) as ColorKey;
        if (keys.has(key) && colors[key] === undefined) {
          colors[key] = value as string;
        }
      }
    }
  }
  return colors;
}

function completeColors(native: Record<string, string>, fallback: Record<string, string>, keys: Set<ColorKey>) {
  function fromNative(key: ColorKey, visiting = new Set<ColorKey>()): string | undefined {
    if (native[key] !== undefined) {
      return native[key];
    }
    if (visiting.has(key)) {
      return undefined;
    }
    visiting.add(key);
    for (const candidate of colorCandidates(key)) {
      const value = fromNative(candidate, visiting);
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }
  return Object.fromEntries(
    [...keys].map((key) => {
      const value = fromNative(key) ?? fallback[key];
      if (value === undefined) {
        throw new Error(`Missing Fluent color token: ${key}`);
      }
      return [key, value];
    }),
  );
}

// Desktop pipelines without font aliases use their own global ramp, not another platform's font family.
const fontRamp: Record<string, [number, string]> = {
  caption1: [100, 'regular'],
  caption1Strong: [100, 'semibold'],
  caption2: [100, 'regular'],
  body1: [200, 'regular'],
  body1Strong: [200, 'semibold'],
  body2: [300, 'regular'],
  body2Strong: [300, 'semibold'],
  subtitle1: [500, 'regular'],
  subtitle1Strong: [500, 'semibold'],
  subtitle2: [400, 'regular'],
  subtitle2Strong: [400, 'semibold'],
  title1: [700, 'regular'],
  title1Strong: [700, 'semibold'],
  title2: [600, 'regular'],
  title3: [500, 'regular'],
  largeTitle: [900, 'regular'],
  display: [900, 'semibold'],
};
const fontEquivalents: Record<string, string> = {
  caption1Strong: 'caption1',
  caption2: 'caption1',
  subtitle1: 'title2',
  subtitle1Strong: 'title2',
  subtitle2: 'title3',
  subtitle2Strong: 'title3',
  title1Strong: 'title1',
  title2: 'subtitle1',
  title3: 'subtitle2',
};
const legacyFontAliases: Record<string, string> = {
  captionStandard: 'caption1',
  secondaryStandard: 'body1',
  secondarySemibold: 'body1Strong',
  bodyStandard: 'body2',
  bodySemibold: 'body2Strong',
  subheaderStandard: 'subtitle2',
  subheaderSemibold: 'subtitle2Strong',
  headerStandard: 'subtitle1',
  headerSemibold: 'subtitle1Strong',
  heroStandard: 'title1',
  heroSemibold: 'title1Strong',
  heroLargeStandard: 'largeTitle',
  heroLargeSemibold: 'display',
};

function mapFonts(platformData: PlatformData): Record<string, VariantValue> {
  const { mapFontPipelineToTheme } = require(`../src/deprecated/${platformData.mapper}`);
  const { font } = require(`${platformData.paths.light}tokens-global.json`);
  const defaults = Object.fromEntries(
    Object.entries(fontRamp).map(([name, [size, weight]]) => [
      name,
      { fontFamily: font.family.base ?? font.family.default, fontSize: font[`size${size}`], fontWeight: font.weight[weight] },
    ]),
  );
  const tokens = { ...defaults, ...require(`${platformData.paths.light}tokens-aliases.json`) };
  const native: Partial<Variants> = mapFontPipelineToTheme(tokens);
  const variants = { ...native } as Record<string, VariantValue>;
  for (const key of Object.keys(fontRamp)) {
    if (!variants[key]) {
      const equivalent = native[fontEquivalents[key] as keyof Variants];
      const token = tokens[key];
      variants[key] = equivalent
        ? { ...equivalent, ...(key.endsWith('Strong') ? { weight: font.weight.semibold } : {}) }
        : { face: 'primary', size: token.fontSize, weight: token.fontWeight };
    }
  }
  for (const [key, alias] of Object.entries(legacyFontAliases)) {
    variants[key] = variants[alias];
  }
  return variants;
}

/** The appearance whose token data supplies an appearance: its own, or the first fallback the platform supplies. */
function sourceAppearance(platformData: PlatformData, appearance: Appearance): Appearance {
  const candidates = appearance === 'light' || appearance === 'dark' ? [appearance] : [appearance, ...appearanceFallbacks[appearance]];
  const source = candidates.find((candidate) => platformData.paths[candidate]);
  if (!source) {
    throw new Error(`No token data for the ${appearance} appearance`);
  }
  return source;
}

function sourcePath(platformData: PlatformData, appearance: Appearance): string {
  return platformData.paths[sourceAppearance(platformData, appearance)] as string;
}

function appearanceScheme(platformData: PlatformData, appearance: Appearance): 'light' | 'dark' {
  return appearanceSchemes[sourceAppearance(platformData, appearance)];
}

function readAliases(platformData: PlatformData, appearance: Appearance): PipelineTokens {
  const scheme = appearanceScheme(platformData, appearance);
  const base: PipelineTokens = require(`${platformData.paths[scheme]}tokens-aliases.json`);
  const tokens: PipelineTokens = require(`${sourcePath(platformData, appearance)}tokens-aliases.json`);
  return Object.fromEntries(
    [...new Set([...Object.keys(base), ...Object.keys(tokens)])].map((key) => [key, { ...base[key], ...tokens[key] }]),
  );
}

const platformColorPattern = /^PlatformColor\(([A-Za-z][A-Za-z0-9]*)\)$/;

/**
 * Replace the pipeline's `PlatformColor(Name)` strings with PlatformColor calls of the platform's system color names, as
 * processAliasTokens does at runtime.
 */
function toCodeValues(value: unknown, platformColors: Set<string>, colorName: (name: string) => string): unknown {
  if (typeof value === 'string') {
    const match = platformColorPattern.exec(value);
    if (!match) {
      if (value.includes('PlatformColor')) {
        throw new Error(`Unsupported platform color value: ${value}`);
      }
      return value;
    }
    const name = colorName(match[1]);
    platformColors.add(name);
    return expression(`PlatformColor('${name}')`, { pure: true, name: `platformColor${match[1]}` });
  }
  if (Array.isArray(value)) {
    return value.map((item) => toCodeValues(item, platformColors, colorName));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toCodeValues(item, platformColors, colorName)]));
  }
  return value;
}

function nameValue(value: unknown, valuePath: ValuePath): string | undefined {
  if (value && typeof value === 'object' && 'blur' in value) {
    return 'shadowLayer';
  }
  return typeof value === 'string' && valuePath[valuePath.length - 1] === 'weight' ? `fontWeight${value}` : undefined;
}

function generatePlatformFluentTokens(
  platformData: PlatformData,
  colorKeys: Set<ColorKey>,
  fallbackColors: Record<'light' | 'dark', Record<string, string>>,
) {
  const target = path.join(__dirname, '../src/fluent/defaults', platformData.filename);
  const generatedFile = new GeneratedFile(target);
  generatedFile.header = makeComment([
    'WARNING: This file is auto-generated by scripts/fluent-tokens.cts. Do not edit it manually.',
    'Complete Fluent tokens: native values, same-platform equivalents, then same-scheme portable defaults.',
    'An appearance without token data inherits elevated from standard, and high contrast from the other',
    'high-contrast appearance, else from standard. Shared values are emitted once.',
  ]);
  const pool = new ValuePool({ name: nameValue });
  const typeImports = {
    AliasColorTokens: '../types/Color.types',
    BaseShadowAliasTokens: '../types/Shadow.types',
    Variants: '../types/Typography.types',
  };
  pool.reserve(...Object.keys(typeImports));

  // Appearances with token data come first, so each inherited appearance is emitted as an alias of its source.
  const ordered = [
    ...appearances.filter((appearance) => platformData.paths[appearance]),
    ...appearances.filter((appearance) => !platformData.paths[appearance]),
  ];
  const platformColors = new Set<string>();
  for (const appearance of ordered) {
    pool.declare(`${appearance}Shadows`, mapPipelineToShadow(require(`${sourcePath(platformData, appearance)}tokens-shadow.json`)), {
      type: 'BaseShadowAliasTokens',
    });
  }
  for (const appearance of ordered) {
    const native = mapColors(readAliases(platformData, appearance), platformData.mapper, colorKeys);
    const scheme = appearanceScheme(platformData, appearance);
    const colors = completeColors(native, fallbackColors[scheme], colorKeys);
    pool.declare(`${appearance}AliasColors`, toCodeValues(colors, platformColors, platformData.platformColorName ?? ((name) => name)), {
      type: 'Required<AliasColorTokens>',
    });
  }
  pool.declare('fontAliasTokens', mapFonts(platformData), {
    type: 'Required<Variants>',
    comment: 'Font aliases from the light appearance, completed with native equivalents and the platform global ramp.',
  });

  const imports = Object.entries(typeImports).map(([name, from]) => `import type { ${name} } from '${from}';\n`);
  if (platformColors.size > 0) {
    imports.unshift("import { PlatformColor } from 'react-native';\n\n");
  }
  generatedFile.add(...imports, '\n', pool);
  generatedFile.commit();
}

function codegenFluentTokens() {
  const colorKeys = new Set<ColorKey>(Object.keys(colorEquivalents) as ColorKey[]);
  for (const platform of Object.values(platformPaths)) {
    for (const key of Object.keys(mapColors(readAliases(platform, 'light'), platform.mapper))) {
      colorKeys.add(key as ColorKey);
    }
  }
  const fallbackColors = Object.fromEntries(
    (['light', 'dark'] as const).map((appearance) => {
      const colors = Object.assign(
        {},
        ...['android', 'ios', 'win32'].map((platform) =>
          mapColors(readAliases(platformPaths[platform], appearance), platformPaths[platform].mapper, colorKeys),
        ),
      );
      return [appearance, completeColors(colors, {}, colorKeys)];
    }),
  ) as Record<'light' | 'dark', Record<string, string>>;
  for (const platform of Object.values(platformPaths)) {
    generatePlatformFluentTokens(platform, colorKeys, fallbackColors);
  }
}

module.exports = { codegenFluentTokens };
