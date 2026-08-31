import type { ColorValue } from 'react-native';

import { compositeRgba, parseColorValue, rgbaToHex } from '../color/colorValue';
import type { ColorDiagnostic, RgbaColor } from '../color/colorValue';
import type { ThemeColorScheme } from '../theming/appearance.types';
import type { SemanticColorTokenValues } from '../tokens/flex.types';

export type { ColorDiagnostic, ColorDiagnosticReason } from '../color/colorValue';

export const MODE_SURFACE = {
  light: '#ffffff',
  dark: '#000000',
} as const;

export const WCAG = {
  aaText: 4.5,
  aaLargeText: 3,
  aaaText: 7,
  aaaLargeText: 4.5,
  visibleStroke: 3,
} as const;

export type ContrastColorToken = keyof SemanticColorTokenValues;

export interface ContrastTokenReference {
  readonly token: ContrastColorToken;
  readonly upstream: `--gnrc-color-${string}`;
}

export interface ContrastPairing {
  readonly label: string;
  readonly source: 'x3' | 'furn';
  readonly foreground: ContrastTokenReference;
  readonly backgrounds: readonly ContrastTokenReference[];
  readonly minimumRatio: number;
}

export interface ContrastColorDiagnostic extends ColorDiagnostic {
  readonly token: ContrastColorToken;
  readonly role: 'foreground' | 'background';
}

interface PairResultBase {
  readonly pairing: ContrastPairing;
  readonly foreground: ContrastTokenReference;
  readonly background: ContrastTokenReference;
  readonly foregroundValue: ColorValue;
  readonly backgroundValue: ColorValue;
  readonly mode: ThemeColorScheme;
}

export type PairResult =
  | (PairResultBase & {
      readonly status: 'pass' | 'fail';
      readonly ratio: number;
      readonly foregroundResolved: string;
      readonly backgroundResolved: string;
      readonly diagnostics: readonly [];
    })
  | (PairResultBase & {
      readonly status: 'unresolvable';
      readonly ratio: null;
      readonly foregroundResolved: null;
      readonly backgroundResolved: null;
      readonly diagnostics: readonly ContrastColorDiagnostic[];
    });

function upstreamName(token: ContrastColorToken): `--gnrc-color-${string}` {
  return `--gnrc-color-${token.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}`;
}

function token(tokenName: ContrastColorToken): ContrastTokenReference {
  return {
    token: tokenName,
    upstream: upstreamName(tokenName),
  };
}

/**
 * Canonical x3 pairings adapted to FURN's camel-case token names.
 *
 * Source: x3-design/fluent-design@d334acf5cbad813f2b7cd554da942b09a7ff8f10.
 */
export const PAIRINGS = [
  {
    label: 'neutral-primary on neutral surfaces',
    source: 'x3',
    foreground: token('foregroundNeutralPrimary'),
    backgrounds: [
      token('surfaceNeutralNearer'),
      token('surfaceNeutralNear'),
      token('backgroundNeutralSubtle'),
      token('backgroundNeutralSoft'),
    ],
    minimumRatio: WCAG.aaText,
  },
  {
    label: 'neutral-secondary on neutral surfaces',
    source: 'x3',
    foreground: token('foregroundNeutralSecondary'),
    backgrounds: [token('surfaceNeutralNearer'), token('backgroundNeutralSubtle')],
    minimumRatio: WCAG.aaText,
  },
  {
    label: 'neutral-tertiary on neutral surfaces',
    source: 'x3',
    foreground: token('foregroundNeutralTertiary'),
    backgrounds: [token('surfaceNeutralNearer'), token('surfaceNeutralNear')],
    minimumRatio: WCAG.aaLargeText,
  },
  {
    label: 'neutral-onloud on neutral loud/heavy',
    source: 'x3',
    foreground: token('foregroundNeutralOnloud'),
    backgrounds: [token('backgroundNeutralLoud'), token('backgroundNeutralHeavy')],
    minimumRatio: WCAG.aaLargeText,
  },
  {
    label: 'brand-onloud on brand loud/heavy',
    source: 'x3',
    foreground: token('foregroundBrandOnloud'),
    backgrounds: [token('backgroundBrandLoud'), token('backgroundBrandHeavy')],
    minimumRatio: WCAG.aaLargeText,
  },
  {
    label: 'danger-onloud on danger-loud',
    source: 'x3',
    foreground: token('foregroundDangerOnloud'),
    backgrounds: [token('backgroundDangerLoud')],
    minimumRatio: WCAG.aaLargeText,
  },
  {
    label: 'warning-onloud on warning-loud',
    source: 'x3',
    foreground: token('foregroundWarningOnloud'),
    backgrounds: [token('backgroundWarningLoud')],
    minimumRatio: WCAG.aaLargeText,
  },
  {
    label: 'success-onloud on success-loud',
    source: 'x3',
    foreground: token('foregroundSuccessOnloud'),
    backgrounds: [token('backgroundSuccessLoud')],
    minimumRatio: WCAG.aaLargeText,
  },
  {
    label: 'brand-primary on neutral surfaces',
    source: 'x3',
    foreground: token('foregroundBrandPrimary'),
    backgrounds: [token('surfaceNeutralNearer'), token('backgroundNeutralSubtle')],
    minimumRatio: WCAG.aaText,
  },
  {
    label: 'danger-primary on neutral + danger soft/subtle',
    source: 'x3',
    foreground: token('foregroundDangerPrimary'),
    backgrounds: [
      token('surfaceNeutralNearer'),
      token('backgroundNeutralSubtle'),
      token('backgroundDangerSubtle'),
      token('backgroundDangerSoft'),
    ],
    minimumRatio: WCAG.aaText,
  },
  {
    label: 'warning-primary on neutral + warning soft/subtle',
    source: 'x3',
    foreground: token('foregroundWarningPrimary'),
    backgrounds: [
      token('surfaceNeutralNearer'),
      token('backgroundNeutralSubtle'),
      token('backgroundWarningSubtle'),
      token('backgroundWarningSoft'),
    ],
    minimumRatio: WCAG.aaText,
  },
  {
    label: 'success-primary on neutral + success soft/subtle',
    source: 'x3',
    foreground: token('foregroundSuccessPrimary'),
    backgrounds: [
      token('surfaceNeutralNearer'),
      token('backgroundNeutralSubtle'),
      token('backgroundSuccessSubtle'),
      token('backgroundSuccessSoft'),
    ],
    minimumRatio: WCAG.aaText,
  },
  {
    label: 'neutral-heavy stroke on neutral-soft background',
    source: 'furn',
    foreground: token('strokeNeutralHeavy'),
    backgrounds: [token('backgroundNeutralSoft')],
    minimumRatio: WCAG.visibleStroke,
  },
] as const satisfies readonly ContrastPairing[];

function requireLiteralColor(value: ColorValue, operation: string): RgbaColor {
  const result = parseColorValue(value);
  if (result.status === 'unresolvable') {
    throw new TypeError(`${operation}: ${result.diagnostic.message}`);
  }
  return result.color;
}

function opaqueComposite(foreground: RgbaColor, background: RgbaColor): RgbaColor {
  const composite = compositeRgba(foreground, background);
  return {
    r: Math.round(composite.r * 255) / 255,
    g: Math.round(composite.g * 255) / 255,
    b: Math.round(composite.b * 255) / 255,
    a: 1,
  };
}

/** Alpha-composite a literal foreground over an opaque literal background. */
export function composite(foreground: ColorValue, background: ColorValue): string {
  const foregroundColor = requireLiteralColor(foreground, 'composite');
  const backgroundColor = requireLiteralColor(background, 'composite');
  if (backgroundColor.a !== 1) {
    throw new TypeError('composite: the background color must be opaque.');
  }
  return rgbaToHex(opaqueComposite(foregroundColor, backgroundColor));
}

function relativeLuminance({ r, g, b }: RgbaColor): number {
  const linearize = (channel: number): number => (channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function resolveLiteralPair(foreground: RgbaColor, background: RgbaColor, surface: RgbaColor) {
  const backgroundResolved = background.a === 1 ? background : opaqueComposite(background, surface);
  const foregroundResolved = foreground.a === 1 ? foreground : opaqueComposite(foreground, backgroundResolved);
  const foregroundLuminance = relativeLuminance(foregroundResolved);
  const backgroundLuminance = relativeLuminance(backgroundResolved);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return {
    ratio: (lighter + 0.05) / (darker + 0.05),
    foregroundResolved: rgbaToHex(foregroundResolved),
    backgroundResolved: rgbaToHex(backgroundResolved),
  };
}

export function contrastRatio(foreground: ColorValue, background: ColorValue, fallbackSurface: ColorValue = '#ffffff'): number {
  const foregroundColor = requireLiteralColor(foreground, 'contrastRatio');
  const backgroundColor = requireLiteralColor(background, 'contrastRatio');
  const surfaceColor = requireLiteralColor(fallbackSurface, 'contrastRatio');
  if (surfaceColor.a !== 1) {
    throw new TypeError('contrastRatio: the fallback surface must be opaque.');
  }
  return resolveLiteralPair(foregroundColor, backgroundColor, surfaceColor).ratio;
}

function diagnosticFor(
  diagnostic: ColorDiagnostic,
  tokenName: ContrastColorToken,
  role: ContrastColorDiagnostic['role'],
): ContrastColorDiagnostic {
  return {
    ...diagnostic,
    token: tokenName,
    role,
  };
}

export function resolvedPairs(colors: SemanticColorTokenValues, mode: ThemeColorScheme): PairResult[] {
  const surface = requireLiteralColor(MODE_SURFACE[mode], 'resolvedPairs');
  const results: PairResult[] = [];

  for (const pairing of PAIRINGS) {
    const foregroundValue = colors[pairing.foreground.token];
    const foreground = parseColorValue(foregroundValue);
    for (const backgroundReference of pairing.backgrounds) {
      const backgroundValue = colors[backgroundReference.token];
      const background = parseColorValue(backgroundValue);
      const base = {
        pairing,
        foreground: pairing.foreground,
        background: backgroundReference,
        foregroundValue,
        backgroundValue,
        mode,
      };
      const diagnostics: ContrastColorDiagnostic[] = [];
      if (foreground.status === 'unresolvable') {
        diagnostics.push(diagnosticFor(foreground.diagnostic, pairing.foreground.token, 'foreground'));
      }
      if (background.status === 'unresolvable') {
        diagnostics.push(diagnosticFor(background.diagnostic, backgroundReference.token, 'background'));
      }

      if (diagnostics.length > 0 || foreground.status === 'unresolvable' || background.status === 'unresolvable') {
        results.push({
          ...base,
          status: 'unresolvable',
          ratio: null,
          foregroundResolved: null,
          backgroundResolved: null,
          diagnostics,
        });
        continue;
      }

      const resolved = resolveLiteralPair(foreground.color, background.color, surface);
      results.push({
        ...base,
        status: resolved.ratio >= pairing.minimumRatio ? 'pass' : 'fail',
        diagnostics: [],
        ...resolved,
      });
    }
  }

  return results;
}
