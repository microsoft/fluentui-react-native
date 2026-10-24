import { PlatformColor } from 'react-native';

import {
  compositeColor,
  compositeRgba,
  getContrastRatio,
  getHoverColor,
  getInteractionColor,
  getPressColor,
  oklchToRgb,
  parseColorValue,
  resolveContrastColors,
  rgbaToHex,
  rgbToOklch,
} from './index';
import type { InteractionColorOptions } from './index';

describe('color parsing and conversion', () => {
  it('parses supported literal formats', () => {
    expect(parseColorValue('#1238')).toEqual({
      status: 'resolved',
      color: {
        r: 0x11 / 255,
        g: 0x22 / 255,
        b: 0x33 / 255,
        a: 0x88 / 255,
      },
    });
    expect(parseColorValue('rgb(100% 0% 50% / 25%)')).toEqual({
      status: 'resolved',
      color: { r: 1, g: 0, b: 0.5, a: 0.25 },
    });
  });

  it.each([
    ['RGB(255, 128, 0)', { r: 1, g: 128 / 255, b: 0, a: 1 }],
    ['rgba(255, 128, 0, .5)', { r: 1, g: 128 / 255, b: 0, a: 0.5 }],
    ['rgba(255 128 0 / 50%)', { r: 1, g: 128 / 255, b: 0, a: 0.5 }],
    ['rgb(255, 128, 0 / 50%)', { r: 1, g: 128 / 255, b: 0, a: 0.5 }],
    ['rgb(1. 2.5 .5)', { r: 1 / 255, g: 2.5 / 255, b: 0.5 / 255, a: 1 }],
  ])('parses %s without regular expressions', (value, color) => {
    expect(parseColorValue(value)).toEqual({ status: 'resolved', color });
  });

  it.each(['rgba(0 0 0)', 'rgb(0 0 0 / 50% / 25%)', 'rgb(0, 0 0)', 'rgb(256 0 0)', 'rgb(0 0 0 / 101%)'])(
    'rejects malformed literal %s',
    (value) => {
      expect(parseColorValue(value)).toMatchObject({
        status: 'unresolvable',
        diagnostic: { reason: 'unsupported-color-format' },
      });
    },
  );

  it('rejects long invalid input without a backtracking expression', () => {
    const value = `rgb(${' '.repeat(100_000)}x)`;

    expect(parseColorValue(value)).toMatchObject({
      status: 'unresolvable',
      diagnostic: { reason: 'unsupported-color-format' },
    });
  });

  it('preserves native numeric conversion at byte-rounding boundaries', () => {
    const result = parseColorValue('rgba(0, 0, 0, 0.00588235294117647)');

    expect(result.status).toBe('resolved');
    if (result.status === 'resolved') {
      expect(result.color.a).toBe(0.00588235294117647);
      expect(rgbaToHex(result.color)).toBe('#00000001');
    }
  });

  it('formats RGBA and round-trips RGB through OKLCH', () => {
    expect(rgbaToHex({ r: 1, g: 0.5, b: 0, a: 0.5 })).toBe('#ff800080');

    const source = { r: 0.1, g: 0.4, b: 0.8 };
    const roundTrip = oklchToRgb(rgbToOklch(source));
    expect(roundTrip.r).toBeCloseTo(source.r, 6);
    expect(roundTrip.g).toBeCloseTo(source.g, 6);
    expect(roundTrip.b).toBeCloseTo(source.b, 6);
  });

  it('returns diagnostics for unsupported and native colors', () => {
    expect(parseColorValue('red')).toMatchObject({
      status: 'unresolvable',
      diagnostic: { reason: 'unsupported-color-format' },
    });
    expect(parseColorValue(PlatformColor('labelColor'))).toMatchObject({
      status: 'unresolvable',
      diagnostic: { reason: 'non-literal-color' },
    });
  });
});

describe('color compositing and contrast', () => {
  it('composites normalized and literal colors', () => {
    expect(compositeRgba({ r: 0, g: 0, b: 0, a: 0.5 }, { r: 1, g: 1, b: 1, a: 1 })).toEqual({
      r: 0.5,
      g: 0.5,
      b: 0.5,
      a: 1,
    });
    expect(compositeColor('#0000000d', '#ffffff')).toBe('#f2f2f2');
    expect(compositeColor('rgba(255 0 0 / 50%)', '#000000')).toBe('#800000');
  });

  it('resolves effective colors and their WCAG ratio', () => {
    expect(resolveContrastColors('#00000080', '#ffffff')).toEqual({
      ratio: expect.closeTo(4.0041, 4),
      foregroundResolved: '#7f7f7f',
      backgroundResolved: '#ffffff',
    });
    expect(getContrastRatio('#000000', '#ffffff')).toBe(21);
  });

  it('rejects unsupported direct operations', () => {
    expect(() => compositeColor('red', '#ffffff')).toThrow('Unsupported color literal');
    expect(() => compositeColor('#00000080', '#ffffff80')).toThrow('background color must be opaque');
    expect(() => getContrastRatio('#000000', '#ffffff', '#ffffff80')).toThrow('fallback surface must be opaque');
  });
});

describe('raw interaction colors', () => {
  it('defaults to the cool tone, standard direction, and direct compositing', () => {
    const explicit: InteractionColorOptions = { colorTone: 'cool', direction: 'standard', compositing: 'direct' };

    expect(getHoverColor('#ebebeb', 'light')).toEqual({ status: 'derived', value: '#e1e1e1' });
    expect(getPressColor('#ebebeb', 'light')).toEqual({ status: 'derived', value: '#d7d7d7' });
    for (const state of ['hover', 'pressed'] as const) {
      for (const mode of ['light', 'dark'] as const) {
        expect(getInteractionColor('#e9e9e980', mode, state)).toEqual(getInteractionColor('#e9e9e980', mode, state, explicit));
      }
    }
  });

  it('shifts standard colors with the scheme and inverted colors against it', () => {
    expect(getHoverColor('#242424', 'light', { direction: 'inverted' })).toEqual({ status: 'derived', value: '#363636' });
    expect(getHoverColor('#ffffff', 'dark', { direction: 'inverted' })).toEqual({ status: 'derived', value: '#f5f5f5' });
    expect(getHoverColor('#1b1b1b', 'dark')).toEqual({ status: 'derived', value: '#2f2f2f' });
  });

  it('raises standard alpha and keeps inverted alpha', () => {
    expect(getHoverColor('#e9e9e980', 'light')).toEqual({ status: 'derived', value: '#dfdfdf8a' });
    const inverted = getHoverColor('#00000080', 'light', { direction: 'inverted' });

    expect(inverted.status).toBe('derived');
    expect(inverted.value).toMatch(/80$/);
  });

  it('applies the warm reference backdrop only to translucent backdrop colors', () => {
    const backdrop = getHoverColor('#e9e9e980', 'light', { colorTone: 'warm', compositing: 'backdrop' });
    const direct = getHoverColor('#e9e9e980', 'light', { colorTone: 'warm', compositing: 'direct' });

    expect(backdrop).toEqual({ status: 'derived', value: '#dcdcd68a' });
    expect(direct.status).toBe('derived');
    expect(direct.value).not.toBe(backdrop.value);
    expect(direct.value).toMatch(/8a$/);
    expect(getHoverColor('#ebebeb', 'light', { colorTone: 'warm', compositing: 'backdrop' })).toEqual(
      getHoverColor('#ebebeb', 'light', { colorTone: 'warm', compositing: 'direct' }),
    );
  });

  it('ignores compositing for the cool tone', () => {
    expect(getPressColor('#e9e9e980', 'dark', { compositing: 'backdrop' })).toEqual(getPressColor('#e9e9e980', 'dark'));
  });

  it('adds chroma for the warm tone and preserves it for the cool tone', () => {
    const cool = getPressColor('#808080', 'light');
    const warm = getPressColor('#808080', 'light', { colorTone: 'warm' });

    expect(cool.status).toBe('derived');
    expect(warm.status).toBe('derived');
    expect(rgbToOklch(hexChannels(cool.value as string)).C).toBeCloseTo(0, 6);
    expect(rgbToOklch(hexChannels(warm.value as string)).C).toBeGreaterThan(0.005);
  });

  it('reports opaque platform colors instead of deriving a wrong value', () => {
    const rest = PlatformColor('labelColor');
    const result = getInteractionColor(rest, 'light', 'hover', { colorTone: 'warm' });

    expect(result).toMatchObject({
      status: 'unresolvable',
      diagnostic: { reason: 'non-literal-color', state: 'hover' },
    });
    expect(result.value).toBe(rest);
    expect(result.status === 'unresolvable' && 'token' in result.diagnostic).toBe(false);
  });

  it('reports malformed literals', () => {
    expect(getPressColor('rgb(12oops 0 0)', 'light')).toMatchObject({
      status: 'unresolvable',
      diagnostic: { reason: 'unsupported-color-format', state: 'pressed' },
    });
  });
});

function hexChannels(value: string) {
  const parsed = parseColorValue(value);
  if (parsed.status !== 'resolved') {
    throw new Error(`Expected a literal color: ${value}`);
  }
  return parsed.color;
}
