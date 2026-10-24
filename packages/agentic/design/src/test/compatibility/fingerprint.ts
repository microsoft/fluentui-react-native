import { createHash } from 'node:crypto';

import type { Theme } from '../../fluent/types/Theme.types';
import type { FlexTokens } from '../../flex/tokens.types';

type EffectiveColor = { rest: unknown; hover: unknown; pressed: unknown };

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (typeof value === 'function') {
    return '[function]';
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map((key) => [key, sortValue(record[key])]),
    );
  }
  return value;
}

/**
 * A short, order-independent digest of a JSON-compatible value. Snapshots of
 * these digests detect any value change without checking in large payloads.
 */
export function fingerprint(value: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(sortValue(value)) ?? 'undefined')
    .digest('hex')
    .slice(0, 16);
}

/**
 * The color values a consumer observes for each token and interaction state,
 * independent of how the token representation stores omitted states.
 */
export function effectiveFlexColors(color: FlexTokens['color']): Record<string, EffectiveColor> {
  const result: Record<string, EffectiveColor> = {};
  for (const name of Object.keys(color).sort()) {
    const { rest, hover, pressed } = color[name as keyof typeof color];
    result[name] = { rest, hover, pressed };
  }
  return result;
}

export function flexTokenFingerprints(tokens: FlexTokens): Record<string, string | number> {
  const { color, ...groups } = tokens;
  const colors = effectiveFlexColors(color);
  const result: Record<string, string | number> = {
    colorCount: Object.keys(colors).length,
    color: fingerprint(colors),
  };
  for (const group of Object.keys(groups).sort()) {
    result[group] = fingerprint(groups[group as keyof typeof groups]);
  }
  return result;
}

export function themeFingerprints(theme: Theme): Record<string, string | number> {
  const result: Record<string, string | number> = {
    colorCount: Object.keys(theme.colors).length,
  };
  for (const section of Object.keys(theme).sort()) {
    result[section] = fingerprint(theme[section as keyof Theme]);
  }
  return result;
}
