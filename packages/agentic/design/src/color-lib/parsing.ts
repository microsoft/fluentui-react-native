import type { ColorValue } from 'react-native';

import { channelToByte } from './math';
import type { ParsedColorValue, RgbaColor } from './types';

const HEX_COLOR = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;
const RGB_COLOR = /^(rgba?)\((.*)\)$/i;
const NUMERIC_CHANNEL = /^(?:\d+(?:\.\d*)?|\.\d+)%?$/;

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

function parseRgbChannel(value: string): number | undefined {
  if (!NUMERIC_CHANNEL.test(value)) {
    return undefined;
  }
  const percentage = value.endsWith('%');
  const parsed = Number.parseFloat(value);
  const maximum = percentage ? 100 : 255;
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > maximum) {
    return undefined;
  }
  return parsed / maximum;
}

function parseAlphaChannel(value: string): number | undefined {
  if (!NUMERIC_CHANNEL.test(value)) {
    return undefined;
  }
  const percentage = value.endsWith('%');
  const parsed = Number.parseFloat(value);
  const maximum = percentage ? 100 : 1;
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > maximum) {
    return undefined;
  }
  return parsed / maximum;
}

function parseRgbColor(value: string): RgbaColor | undefined {
  const match = RGB_COLOR.exec(value);
  if (!match) {
    return undefined;
  }

  const functionName = match[1].toLowerCase();
  const slashParts = match[2].trim().split(/\s*\/\s*/);
  if (slashParts.length > 2) {
    return undefined;
  }

  const commaSyntax = slashParts[0].includes(',');
  const parts = commaSyntax ? slashParts[0].split(/\s*,\s*/) : slashParts[0].trim().split(/\s+/);
  let alphaPart = slashParts[1];
  if (commaSyntax && parts.length === 4) {
    if (alphaPart !== undefined) {
      return undefined;
    }
    alphaPart = parts.pop();
  }
  if (parts.length !== 3 || (functionName === 'rgba' && alphaPart === undefined)) {
    return undefined;
  }

  const channels = parts.map(parseRgbChannel);
  const alpha = alphaPart === undefined ? 1 : parseAlphaChannel(alphaPart);
  if (channels.some((channel) => channel === undefined) || alpha === undefined) {
    return undefined;
  }

  return {
    r: channels[0],
    g: channels[1],
    b: channels[2],
    a: alpha,
  };
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
