import { PlatformColor } from 'react-native';

import type { FlexColorInput, InteractiveColorType } from '../tokens.types';
import { flexColor, normalizeFlexColor, resolveExplicitFlexColor, selectColorEntry } from './flexColor';
import { createInteractiveColor } from './interactiveColor';

const light = { colorScheme: 'light' } as const;
const dark = { colorScheme: 'dark' } as const;

describe('flexColor', () => {
  it('describes a single value with the requested type', () => {
    expect(flexColor('#123456')).toEqual({ rest: '#123456', type: 'standard' });
    expect(flexColor('#123456', 'inverted')).toEqual({ rest: '#123456', type: 'inverted' });
  });

  it('lets an explicit value type win over the second argument', () => {
    expect(flexColor({ rest: '#123456', type: 'fixed' }, 'inverted')).toEqual({ rest: '#123456', type: 'fixed' });
    expect(flexColor({ rest: '#123456' }, 'inverted')).toEqual({ rest: '#123456', type: 'inverted' });
  });

  it('returns a new frozen description without mutating the input', () => {
    const tuple = ['#ffffff', '#000000'] as const;
    const input = { rest: tuple, hover: '#eeeeee' };
    const snapshot = structuredClone(input);

    const result = flexColor(input, 'inverted');

    expect(result).not.toBe(input);
    expect(input).toEqual(snapshot);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.rest)).toBe(true);
    expect(result.rest).not.toBe(tuple);
    expect(result).toEqual({ rest: ['#ffffff', '#000000'], hover: '#eeeeee', type: 'inverted' });
    expect(Object.keys(result)).toEqual(['rest', 'hover', 'type']);
  });

  it('accepts frozen inputs and native colors', () => {
    const native = PlatformColor('controlAccentColor');

    expect(flexColor(Object.freeze({ rest: native, pressed: '#000000' }))).toEqual({ rest: native, pressed: '#000000', type: 'standard' });
    expect(flexColor([native, '#000000']).rest).toEqual([native, '#000000']);
  });

  it('validates tuples, options, and types', () => {
    expect(() => flexColor(['#ffffff'] as unknown as FlexColorInput)).toThrow('exactly two colors');
    expect(() => flexColor(['#ffffff', '#000000', '#111111'] as unknown as FlexColorInput)).toThrow('exactly two colors');
    expect(() => flexColor({ rest: '#ffffff', focused: '#000000' } as unknown as FlexColorInput)).toThrow('unknown option "focused"');
    expect(() => flexColor({ hover: '#000000' } as unknown as FlexColorInput)).toThrow('must include rest');
    expect(() => flexColor({ rest: { rest: '#000000' } } as unknown as FlexColorInput)).toThrow('not nested interaction options');
    expect(() => flexColor({ rest: ['#ffffff', { rest: '#000000' }] } as unknown as FlexColorInput)).toThrow(
      'not nested interaction options',
    );
    expect(() => flexColor({ rest: '#ffffff', type: 'loud' as InteractiveColorType })).toThrow('invalid type loud');
    expect(() => flexColor('#ffffff', 'loud' as InteractiveColorType)).toThrow('invalid type loud');
    expect(() => flexColor(true as unknown as FlexColorInput)).toThrow('must be a color value');
  });

  it('rejects resolved colors as authored input', () => {
    const resolved = createInteractiveColor('#ffffff', '#eeeeee', '#dddddd');

    expect(() => flexColor(resolved as unknown as FlexColorInput)).toThrow('resolved InteractiveColor');
    expect(() => flexColor({ rest: resolved } as unknown as FlexColorInput)).toThrow('resolved InteractiveColor');
  });
});

describe('normalizeFlexColor', () => {
  it('returns a package-normalized description unchanged', () => {
    const description = flexColor('#123456', 'inverted');

    expect(normalizeFlexColor(description)).toBe(description);
    expect(normalizeFlexColor(description, 'fixed')).toBe(description);
  });

  it('uses the default type for plain inputs', () => {
    expect(normalizeFlexColor('#123456')).toEqual({ rest: '#123456', type: 'standard' });
    expect(normalizeFlexColor({ rest: '#123456' }, 'inverted')).toEqual({ rest: '#123456', type: 'inverted' });
  });

  it('labels validation errors with the token path', () => {
    expect(() => normalizeFlexColor({ hover: '#000000' } as unknown as FlexColorInput, 'standard', 'color.backgroundBrandHeavy')).toThrow(
      'color.backgroundBrandHeavy must include rest',
    );
  });
});

describe('selectColorEntry', () => {
  it('uses a single value for every scheme', () => {
    expect(selectColorEntry('#123456', light)).toBe('#123456');
    expect(selectColorEntry('#123456', dark)).toBe('#123456');
  });

  it('selects light at index zero and dark at index one', () => {
    expect(selectColorEntry(['#ffffff', '#000000'], light)).toBe('#ffffff');
    expect(selectColorEntry(['#ffffff', '#000000'], dark)).toBe('#000000');
  });

  it('rejects malformed tuples', () => {
    expect(() => selectColorEntry(['#ffffff'] as unknown as readonly [string, string], light)).toThrow('exactly [light, dark]');
  });
});

describe('resolveExplicitFlexColor', () => {
  it('resolves omitted states to rest and keeps explicit states', () => {
    const resolved = resolveExplicitFlexColor(normalizeFlexColor({ rest: ['#ffffff', '#000000'], pressed: ['#dddddd', '#222222'] }), dark);

    expect(resolved).toEqual({ rest: '#000000', hover: '#000000', pressed: '#222222' });
    expect(Object.isFrozen(resolved)).toBe(true);
  });
});
