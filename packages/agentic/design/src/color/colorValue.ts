import type { ColorValue } from 'react-native';

export type ColorDiagnosticReason = 'non-literal-color' | 'unsupported-color-format';

export interface ColorDiagnostic {
  readonly reason: ColorDiagnosticReason;
  readonly value: ColorValue;
  readonly message: string;
}

export interface RgbaColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

export type ParsedColorValue =
  | {
      readonly status: 'resolved';
      readonly color: RgbaColor;
    }
  | {
      readonly status: 'unresolvable';
      readonly diagnostic: ColorDiagnostic;
    };

const HEX_COLOR = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;
const RGB_COLOR = /^(rgba?)\((.*)\)$/i;
const NUMERIC_CHANNEL = /^(?:\d+(?:\.\d*)?|\.\d+)%?$/;

export function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.max(minimum, Math.min(maximum, value));
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

function channelToHex(value: number): string {
  return Math.round(clamp(value) * 255)
    .toString(16)
    .padStart(2, '0');
}

export function rgbaToHex(color: RgbaColor): string {
  const rgb = `#${channelToHex(color.r)}${channelToHex(color.g)}${channelToHex(color.b)}`;
  const alpha = channelToHex(color.a);
  return alpha === 'ff' ? rgb : `${rgb}${alpha}`;
}

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
