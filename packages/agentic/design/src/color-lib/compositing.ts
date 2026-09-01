import type { ColorValue } from 'react-native';

import { requireLiteralColor, rgbaToHex } from './parsing';
import type { ResolvedContrastColors, RgbaColor } from './types';

/**
 * Alpha-composite normalized foreground channels over normalized background
 * channels and retain the resulting alpha.
 */
export function compositeRgba(foreground: RgbaColor, background: RgbaColor): RgbaColor {
  const outputAlpha = foreground.a + background.a * (1 - foreground.a);
  if (outputAlpha === 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  return {
    r: (foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / outputAlpha,
    g: (foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / outputAlpha,
    b: (foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / outputAlpha,
    a: outputAlpha,
  };
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

/**
 * Alpha-composite a literal foreground color over an opaque literal
 * background and return the resolved hex color.
 */
export function compositeColor(foreground: ColorValue, background: ColorValue): string {
  const foregroundColor = requireLiteralColor(foreground, 'compositeColor');
  const backgroundColor = requireLiteralColor(background, 'compositeColor');
  if (backgroundColor.a !== 1) {
    throw new TypeError('compositeColor: the background color must be opaque.');
  }
  return rgbaToHex(opaqueComposite(foregroundColor, backgroundColor));
}

function relativeLuminance({ r, g, b }: RgbaColor): number {
  const linearize = (channel: number): number => (channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Resolve translucent foreground and background literals against an opaque
 * fallback surface and return both effective colors with their WCAG ratio.
 */
export function resolveContrastColors(
  foreground: ColorValue,
  background: ColorValue,
  fallbackSurface: ColorValue = '#ffffff',
): ResolvedContrastColors {
  const foregroundColor = requireLiteralColor(foreground, 'resolveContrastColors');
  const backgroundColor = requireLiteralColor(background, 'resolveContrastColors');
  const surfaceColor = requireLiteralColor(fallbackSurface, 'resolveContrastColors');
  if (surfaceColor.a !== 1) {
    throw new TypeError('resolveContrastColors: the fallback surface must be opaque.');
  }

  const backgroundResolved = backgroundColor.a === 1 ? backgroundColor : opaqueComposite(backgroundColor, surfaceColor);
  const foregroundResolved = foregroundColor.a === 1 ? foregroundColor : opaqueComposite(foregroundColor, backgroundResolved);
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

/**
 * Calculate the WCAG contrast ratio for two literal colors, compositing alpha
 * values against the supplied opaque fallback surface.
 */
export function getContrastRatio(foreground: ColorValue, background: ColorValue, fallbackSurface: ColorValue = '#ffffff'): number {
  return resolveContrastColors(foreground, background, fallbackSurface).ratio;
}
