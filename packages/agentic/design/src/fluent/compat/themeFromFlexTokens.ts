import type { FlexTokens, SemanticColorTokenValues, SemanticMotion, SemanticShadows, SemanticSpacing } from '../../flex/tokens.types';
import reverseProjection from '../../tokens/mappings/theme-from-flex.json' with { type: 'json' };
import { appearanceOptionFromResolved } from '../../theming/appearance';
import type { ResolvedThemeAppearance } from '../../types/appearance.types';
import { ensureParentRecord, getValueAtSegments, isRecord, splitObjectPath } from '../../utilities/objects';
import { mergeTheme } from '../mergeTheme';
import type { ShadowToken } from '../types/Shadow.types';
import type { PartialTheme, Theme } from '../types/Theme.types';

import { getDefaultLegacyTheme } from './defaultLegacyTheme';

type ReverseTransform = 'numberToPx' | 'shadowLayersToToken';

type ReverseProjectionEntry = {
  source: string;
  fallback?: string;
  transform?: ReverseTransform;
};

export interface ThemeFromFlexTokensOptions {
  fallback?: Theme | PartialTheme;
}

/**
 * Flex tokens in the representation used before interactive colors: each color
 * is its rest value, optional `color.hover` and `color.pressed` maps hold
 * explicit states, a shadow may be a legacy `{ ambient, key }` token, and the
 * later `motion` group and `spacing.componentBase800` may be absent.
 *
 * @deprecated Pass resolved {@link FlexTokens}, whose colors carry
 * `rest`, `hover`, and `pressed`.
 */
export type FlatFlexTokens = Omit<FlexTokens, 'color' | 'shadow' | 'spacing' | 'motion'> & {
  color: SemanticColorTokenValues & {
    hover?: Partial<SemanticColorTokenValues>;
    pressed?: Partial<SemanticColorTokenValues>;
  };
  shadow: { [Name in keyof SemanticShadows]: SemanticShadows[Name] | ShadowToken };
  spacing: Omit<SemanticSpacing, 'componentBase800'> & Partial<Pick<SemanticSpacing, 'componentBase800'>>;
  motion?: SemanticMotion;
};

const colorStatePathPattern = /^color\.([^.]+)\.(rest|hover|pressed)$/;

function getOwnValue(source: unknown, key: string): unknown {
  return isRecord(source) && Object.prototype.hasOwnProperty.call(source, key) ? source[key] : undefined;
}

/**
 * Read a color state from resolved tokens, or from the flat representation
 * where the color is its rest value and states live in `color.<state>` maps.
 */
function getColorState(tokens: FlexTokens | FlatFlexTokens, name: string, state: string): unknown {
  const colors = getOwnValue(tokens, 'color');
  const entry = getOwnValue(colors, name);
  if (isRecord(entry) && Object.prototype.hasOwnProperty.call(entry, 'rest')) {
    return entry[state];
  }
  return state === 'rest' ? entry : getOwnValue(getOwnValue(colors, state), name);
}

function getPathSegments(path: string): string[] {
  return splitObjectPath(path, () => new Error(`Invalid generated theme projection path "${path}".`));
}

function getValueAtPath(source: FlexTokens | FlatFlexTokens, path: string): unknown {
  const colorState = colorStatePathPattern.exec(path);
  if (colorState) {
    return getColorState(source, colorState[1], colorState[2]);
  }
  return getValueAtSegments(source, getPathSegments(path));
}

// Later projection entries overwrite earlier leaves; conflicting parents are generator errors.
function setValueAtPath(destination: Record<string, unknown>, path: string, value: unknown): void {
  const segments = getPathSegments(path);
  const target = ensureParentRecord(destination, segments, () => new Error(`Cannot create generated theme projection path "${path}".`));
  target[segments[segments.length - 1]] = value;
}

function shadowLayersToToken(value: unknown): unknown {
  if (!Array.isArray(value)) {
    // Pass through a legacy { ambient, key } shadow.
    return value;
  }
  if (value.length === 0) {
    return undefined;
  }
  return { ambient: value[0], key: value[value.length - 1] };
}

function applyTransform(value: unknown, transform?: ReverseTransform): unknown {
  if (!transform) {
    return value;
  }
  if (transform === 'numberToPx') {
    return typeof value === 'number' ? `${value}px` : value;
  }
  if (transform === 'shadowLayersToToken') {
    return shadowLayersToToken(value);
  }
  return value;
}

function projectThemeValues(tokens: FlexTokens | FlatFlexTokens): PartialTheme {
  const projected: Record<string, unknown> = {};
  for (const [themePath, descriptor] of Object.entries(reverseProjection as Record<string, ReverseProjectionEntry>)) {
    let value = getValueAtPath(tokens, descriptor.source);
    if (value === undefined && descriptor.fallback) {
      value = getValueAtPath(tokens, descriptor.fallback);
    }
    if (value !== undefined) {
      value = applyTransform(value, descriptor.transform);
    }
    if (value !== undefined) {
      setValueAtPath(projected, themePath, value);
    }
  }
  return projected as PartialTheme;
}

/**
 * Project Flex tokens into a complete legacy Theme.
 *
 * The compatibility base fills legacy-only values, the optional fallback adds
 * author or host metadata, mapped Flex values remain authoritative, and the
 * final host appearance reflects the resolved structured appearance. Reading
 * a derived interaction state computes it. Layered Flex shadows project
 * lossily to legacy { ambient, key } shadows: the first layer is ambient, the
 * last is key, and middle layers are dropped. An empty shadow keeps the
 * legacy base shadow.
 */
export function themeFromFlexTokens(
  tokens: FlexTokens | FlatFlexTokens,
  appearance: ResolvedThemeAppearance,
  options?: { fallback?: Theme | PartialTheme },
): Theme {
  let theme = getDefaultLegacyTheme(appearance);
  if (options?.fallback) {
    theme = mergeTheme(theme, options.fallback as PartialTheme);
  }
  theme = mergeTheme(theme, projectThemeValues(tokens));
  return mergeTheme(theme, {
    host: {
      appearance: appearanceOptionFromResolved(appearance),
    },
  });
}
