import { defaultFlexTokenDescription } from './defaults/defaultTokens';
import { assertShadowEntries, mergeShadowEntries, resolveShadowEntries, selectShadowEntry } from './flexShadow';
import { mergeFlexTokenDescription } from './flexTokenDescription';
import type { FlexShadow, FlexShadowEntry, SemanticShadowEntries } from './tokens.types';

const contour = { x: 0, y: 0, blur: 2, color: '#0000001a' };
const key = { x: 0, y: 2, blur: 4, color: '#00000024' };
const lightShadow: FlexShadow = [contour, key];
const darkShadow: FlexShadow = [
  { ...contour, color: '#00000033' },
  { ...key, color: '#00000048' },
];

describe('selectShadowEntry', () => {
  it('uses one shadow for every scheme', () => {
    expect(selectShadowEntry(lightShadow, { colorScheme: 'light' })).toBe(lightShadow);
    expect(selectShadowEntry(lightShadow, { colorScheme: 'dark' })).toBe(lightShadow);
  });

  it('selects a light/dark tuple by scheme', () => {
    const entry: FlexShadowEntry = [lightShadow, darkShadow];

    expect(selectShadowEntry(entry, { colorScheme: 'light' })).toBe(lightShadow);
    expect(selectShadowEntry(entry, { colorScheme: 'dark' })).toBe(darkShadow);
  });

  it('treats an empty shadow as one shadow with no layers', () => {
    expect(selectShadowEntry([], { colorScheme: 'dark' })).toEqual([]);
  });
});

describe('resolveShadowEntries', () => {
  it('selects every entry for the scheme and freezes the result', () => {
    const resolved = resolveShadowEntries(defaultFlexTokenDescription.shadow, { colorScheme: 'dark' });

    expect(Object.isFrozen(resolved)).toBe(true);
    expect(Object.keys(resolved)).toEqual(Object.keys(defaultFlexTokenDescription.shadow));
    for (const [name, entry] of Object.entries(defaultFlexTokenDescription.shadow)) {
      expect(resolved[name as keyof typeof resolved]).toBe(selectShadowEntry(entry, { colorScheme: 'dark' }));
    }
  });
});

describe('assertShadowEntries', () => {
  it('accepts layered shadows, tuples, and undefined entries', () => {
    expect(() => assertShadowEntries({ low: lightShadow, high: [lightShadow, darkShadow], higher: undefined })).not.toThrow();
  });

  it.each([
    ['an array', []],
    ['null', null],
    ['a string', 'low'],
  ])('rejects %s as the shadow group', (_label, shadows) => {
    expect(() => assertShadowEntries(shadows)).toThrow('Flex shadow overrides must be an object keyed by semantic shadow name.');
  });

  it.each([
    ['a layer without a color', [{ x: 0, y: 0, blur: 2 }]],
    ['a layer with a string offset', [{ x: '0px', y: 0, blur: 2, color: '#000000' }]],
    ['a single layer object', contour],
    ['a three-shadow tuple', [lightShadow, darkShadow, lightShadow]],
  ])('rejects %s', (_label, value) => {
    expect(() => assertShadowEntries({ low: value })).toThrow(
      'shadow.low must be an array of { x, y, blur, color } shadow layers or a [light, dark] tuple of them.',
    );
  });

  it('explains how to author a legacy { ambient, key } shadow', () => {
    expect(() => assertShadowEntries({ low: { ambient: contour, key } })).toThrow(
      'Author a legacy { ambient, key } shadow as [ambient, key].',
    );
  });
});

describe('mergeShadowEntries', () => {
  const base = defaultFlexTokenDescription.shadow;

  it('replaces each entry atomically', () => {
    const merged = mergeShadowEntries(base, { low: lightShadow });

    expect(merged.low).toBe(lightShadow);
    expect(merged.high).toBe(base.high);
    expect(Object.isFrozen(merged)).toBe(true);
  });

  it('keeps the base for undefined and unchanged entries', () => {
    expect(mergeShadowEntries(base, { low: undefined, high: base.high })).toBe(base);
  });

  it('validates overrides', () => {
    expect(() => mergeShadowEntries(base, { low: { ambient: contour, key } })).toThrow('shadow.low');
  });
});

describe('mergeFlexTokenDescription shadows', () => {
  it('replaces a light/dark tuple with one shadow instead of merging layers', () => {
    const merged = mergeFlexTokenDescription(defaultFlexTokenDescription, { shadow: { lowest: [contour] } });

    expect(merged.shadow.lowest).toEqual([contour]);
    expect(merged.shadow.lower).toBe(defaultFlexTokenDescription.shadow.lower);
    expect(merged.color).toBe(defaultFlexTokenDescription.color);
  });

  it('does not remove a shadow for an undefined override', () => {
    const shadow: Partial<SemanticShadowEntries> = { lowest: undefined };

    expect(mergeFlexTokenDescription(defaultFlexTokenDescription, { shadow })).toBe(defaultFlexTokenDescription);
  });
});
