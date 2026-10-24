import type { FlexTokens } from '../../flex/tokens.types';
import reverseProjection from '../../tokens/mappings/theme-from-flex.json' with { type: 'json' };
import { appearanceOptionFromResolved } from '../../theming/appearance';
import type { ResolvedThemeAppearance } from '../../types/appearance.types';
import { ensureParentRecord, getValueAtSegments, splitObjectPath } from '../../utilities/objects';
import { mergeTheme } from '../mergeTheme';
import type { PartialTheme, Theme } from '../types/Theme.types';

import { getDefaultLegacyTheme } from './defaultLegacyTheme';

type ReverseTransform = 'numberToPx';

type ReverseProjectionEntry = {
  source: string;
  fallback?: string;
  transform?: ReverseTransform;
};

export interface ThemeFromFlexTokensOptions {
  fallback?: Theme | PartialTheme;
}

function getPathSegments(path: string): string[] {
  return splitObjectPath(path, () => new Error(`Invalid generated theme projection path "${path}".`));
}

function getValueAtPath(source: object, path: string): unknown {
  return getValueAtSegments(source, getPathSegments(path));
}

// Later projection entries overwrite earlier leaves; conflicting parents are generator errors.
function setValueAtPath(destination: Record<string, unknown>, path: string, value: unknown): void {
  const segments = getPathSegments(path);
  const target = ensureParentRecord(destination, segments, () => new Error(`Cannot create generated theme projection path "${path}".`));
  target[segments[segments.length - 1]] = value;
}

function applyTransform(value: unknown, transform?: ReverseTransform): unknown {
  if (!transform) {
    return value;
  }
  if (transform === 'numberToPx') {
    return typeof value === 'number' ? `${value}px` : value;
  }
  return value;
}

function projectThemeValues(tokens: FlexTokens): PartialTheme {
  const projected: Record<string, unknown> = {};
  for (const [themePath, descriptor] of Object.entries(reverseProjection as Record<string, ReverseProjectionEntry>)) {
    let value = getValueAtPath(tokens, descriptor.source);
    if (value === undefined && descriptor.fallback) {
      value = getValueAtPath(tokens, descriptor.fallback);
    }
    if (value !== undefined) {
      setValueAtPath(projected, themePath, applyTransform(value, descriptor.transform));
    }
  }
  return projected as PartialTheme;
}

/**
 * Project Flex tokens into a complete legacy Theme.
 *
 * The compatibility base fills legacy-only values, the optional fallback adds
 * author or host metadata, mapped Flex values remain authoritative, and the
 * final host appearance reflects the resolved structured appearance.
 */
export function themeFromFlexTokens(
  tokens: FlexTokens,
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
