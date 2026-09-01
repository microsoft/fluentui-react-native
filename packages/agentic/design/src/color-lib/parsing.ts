import type { ColorValue } from 'react-native';

import { channelToByte } from './math';
import type { ParsedColorValue, RgbaColor } from './types';

const HEX_COLOR = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;

interface ParsedChannel {
  readonly value: number;
  readonly nextIndex: number;
}

function parseHexColor(value: string): RgbaColor | undefined {
  const match = HEX_COLOR.exec(value);
  if (!match) {
    return undefined;
  }

  let hex = match[1];
  if (hex.length === 3 || hex.length === 4) {
    hex = [...hex].map((channel) => `${channel}${channel}`).join('');
  }

  return {
    r: Number.parseInt(hex.slice(0, 2), 16) / 255,
    g: Number.parseInt(hex.slice(2, 4), 16) / 255,
    b: Number.parseInt(hex.slice(4, 6), 16) / 255,
    a: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
  };
}

function isWhitespace(characterCode: number): boolean {
  return characterCode === 0x20 || (characterCode >= 0x09 && characterCode <= 0x0d);
}

function skipWhitespace(value: string, index: number, endIndex: number): number {
  while (index < endIndex && isWhitespace(value.charCodeAt(index))) {
    index += 1;
  }
  return index;
}

function parseNumericChannel(
  value: string,
  index: number,
  endIndex: number,
  numericMaximum: number,
  percentageMaximum: number,
): ParsedChannel | undefined {
  const startIndex = index;
  let digits = 0;

  while (index < endIndex) {
    const digit = value.charCodeAt(index) - 0x30;
    if (digit < 0 || digit > 9) {
      break;
    }
    digits += 1;
    index += 1;
  }

  if (index < endIndex && value.charCodeAt(index) === 0x2e) {
    index += 1;
    while (index < endIndex) {
      const digit = value.charCodeAt(index) - 0x30;
      if (digit < 0 || digit > 9) {
        break;
      }
      digits += 1;
      index += 1;
    }
  }

  if (digits === 0) {
    return undefined;
  }

  const numericEndIndex = index;
  const percentage = index < endIndex && value.charCodeAt(index) === 0x25;
  if (percentage) {
    index += 1;
  }
  const maximum = percentage ? percentageMaximum : numericMaximum;
  const parsed = Number.parseFloat(value.slice(startIndex, numericEndIndex));
  if (!Number.isFinite(parsed) || parsed > maximum) {
    return undefined;
  }

  return {
    value: parsed / maximum,
    nextIndex: index,
  };
}

function parseRgbChannel(value: string, index: number, endIndex: number): ParsedChannel | undefined {
  return parseNumericChannel(value, index, endIndex, 255, 100);
}

function parseAlphaChannel(value: string, index: number, endIndex: number): ParsedChannel | undefined {
  return parseNumericChannel(value, index, endIndex, 1, 100);
}

function parseCommaRgbColor(value: string, index: number, endIndex: number, red: number, alphaRequired: boolean): RgbaColor | undefined {
  index = skipWhitespace(value, index + 1, endIndex);
  const green = parseRgbChannel(value, index, endIndex);
  if (!green) {
    return undefined;
  }

  index = skipWhitespace(value, green.nextIndex, endIndex);
  if (value.charCodeAt(index) !== 0x2c) {
    return undefined;
  }

  index = skipWhitespace(value, index + 1, endIndex);
  const blue = parseRgbChannel(value, index, endIndex);
  if (!blue) {
    return undefined;
  }

  index = skipWhitespace(value, blue.nextIndex, endIndex);
  let alpha = 1;
  if (index < endIndex && (value.charCodeAt(index) === 0x2c || value.charCodeAt(index) === 0x2f)) {
    index = skipWhitespace(value, index + 1, endIndex);
    const parsedAlpha = parseAlphaChannel(value, index, endIndex);
    if (!parsedAlpha) {
      return undefined;
    }
    alpha = parsedAlpha.value;
    index = skipWhitespace(value, parsedAlpha.nextIndex, endIndex);
  } else if (alphaRequired) {
    return undefined;
  }

  return index === endIndex ? { r: red, g: green.value, b: blue.value, a: alpha } : undefined;
}

function parseSpaceRgbColor(value: string, index: number, endIndex: number, red: number, alphaRequired: boolean): RgbaColor | undefined {
  const green = parseRgbChannel(value, index, endIndex);
  if (!green) {
    return undefined;
  }

  index = skipWhitespace(value, green.nextIndex, endIndex);
  if (index === green.nextIndex) {
    return undefined;
  }

  const blue = parseRgbChannel(value, index, endIndex);
  if (!blue) {
    return undefined;
  }

  index = skipWhitespace(value, blue.nextIndex, endIndex);
  let alpha = 1;
  if (index < endIndex && value.charCodeAt(index) === 0x2f) {
    index = skipWhitespace(value, index + 1, endIndex);
    const parsedAlpha = parseAlphaChannel(value, index, endIndex);
    if (!parsedAlpha) {
      return undefined;
    }
    alpha = parsedAlpha.value;
    index = skipWhitespace(value, parsedAlpha.nextIndex, endIndex);
  } else if (alphaRequired) {
    return undefined;
  }

  return index === endIndex ? { r: red, g: green.value, b: blue.value, a: alpha } : undefined;
}

function parseRgbColor(value: string): RgbaColor | undefined {
  if (value.charCodeAt(value.length - 1) !== 0x29) {
    return undefined;
  }

  let index: number;
  let alphaRequired: boolean;
  if (value.length >= 5 && value.charCodeAt(3) === 0x28 && value.slice(0, 3).toLowerCase() === 'rgb') {
    index = 4;
    alphaRequired = false;
  } else if (value.length >= 6 && value.charCodeAt(4) === 0x28 && value.slice(0, 4).toLowerCase() === 'rgba') {
    index = 5;
    alphaRequired = true;
  } else {
    return undefined;
  }

  const endIndex = value.length - 1;
  index = skipWhitespace(value, index, endIndex);
  const red = parseRgbChannel(value, index, endIndex);
  if (!red) {
    return undefined;
  }

  const separatorIndex = red.nextIndex;
  index = skipWhitespace(value, separatorIndex, endIndex);
  if (value.charCodeAt(index) === 0x2c) {
    return parseCommaRgbColor(value, index, endIndex, red.value, alphaRequired);
  }
  if (index === separatorIndex) {
    return undefined;
  }
  return parseSpaceRgbColor(value, index, endIndex, red.value, alphaRequired);
}

/**
 * Parse a React Native color value when it is a hex, `rgb()`, or `rgba()`
 * literal. Native and dynamic color objects return a structured diagnostic.
 */
export function parseColorValue(value: ColorValue): ParsedColorValue {
  if (typeof value !== 'string') {
    return {
      status: 'unresolvable',
      diagnostic: {
        reason: 'non-literal-color',
        value,
        message: 'Native and dynamic color objects cannot be resolved in JavaScript.',
      },
    };
  }

  const normalized = value.trim();
  const color = parseHexColor(normalized) ?? parseRgbColor(normalized);
  return color
    ? { status: 'resolved', color }
    : {
        status: 'unresolvable',
        diagnostic: {
          reason: 'unsupported-color-format',
          value,
          message: `Unsupported color literal "${value}". Use hex, rgb(), or rgba().`,
        },
      };
}

/**
 * Format normalized RGBA channels as `#rrggbb` or `#rrggbbaa` when alpha is
 * translucent.
 */
export function rgbaToHex(color: RgbaColor): string {
  const toHex = (value: number) => channelToByte(value).toString(16).padStart(2, '0');
  const rgb = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  const alpha = toHex(color.a);
  return alpha === 'ff' ? rgb : `${rgb}${alpha}`;
}

/** @internal Resolve a literal color or throw a descriptive operation error. */
export function requireLiteralColor(value: ColorValue, operation: string): RgbaColor {
  const result = parseColorValue(value);
  if (result.status === 'unresolvable') {
    throw new TypeError(`${operation}: ${result.diagnostic.message}`);
  }
  return result.color;
}
