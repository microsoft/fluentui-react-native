import { createTokenRegistry } from './tokenRegistry.ts';

describe('createTokenRegistry', () => {
  it('records and recovers a path for a registered value', () => {
    const reg = createTokenRegistry();
    reg.register('colors.background', '#abc123');
    expect(reg.lookup('#abc123')).toBe('colors.background');
  });

  it('returns undefined for null, undefined, and unknown values', () => {
    const reg = createTokenRegistry();
    reg.register('colors.background', '#abc123');
    expect(reg.lookup(null)).toBeUndefined();
    expect(reg.lookup(undefined)).toBeUndefined();
    expect(reg.lookup('#000000')).toBeUndefined();
  });

  it('silently ignores attempts to register null/undefined', () => {
    const reg = createTokenRegistry();
    reg.register('a', null);
    reg.register('b', undefined);
    expect(reg.entries()).toHaveLength(0);
  });

  it('treats a duplicate (path,value) pair as a no-op', () => {
    const reg = createTokenRegistry();
    reg.register('x', 42);
    expect(() => reg.register('x', 42)).not.toThrow();
    expect(reg.entries()).toHaveLength(1);
  });

  it('throws when the same value would map to two distinct paths', () => {
    const reg = createTokenRegistry();
    reg.register('a', 'shared');
    expect(() => reg.register('b', 'shared')).toThrow(/value collision/);
  });

  it('throws when the same path would map to two distinct values', () => {
    const reg = createTokenRegistry();
    reg.register('a', 1);
    expect(() => reg.register('a', 2)).toThrow(/already registered/);
  });

  it('preserves insertion order in entries()', () => {
    const reg = createTokenRegistry();
    reg.register('first', 1);
    reg.register('second', 2);
    reg.register('third', 3);
    expect(reg.entries().map((e) => e.path)).toEqual(['first', 'second', 'third']);
  });

  it('returns a snapshot copy, not a live view, from entries()', () => {
    const reg = createTokenRegistry();
    reg.register('a', 1);
    const snap = reg.entries();
    reg.register('b', 2);
    expect(snap).toHaveLength(1);
    expect(reg.entries()).toHaveLength(2);
  });
});
