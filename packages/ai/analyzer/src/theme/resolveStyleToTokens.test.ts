import { createTokenRegistry } from './tokenRegistry.ts';
import { resolveStyleToTokens } from './resolveStyleToTokens.ts';

describe('resolveStyleToTokens', () => {
  it('annotates entries whose values match registered tokens', () => {
    const reg = createTokenRegistry();
    reg.register('colors.brandBackground', '#0f6cbd');
    reg.register('colors.neutralForegroundOnColor', '#ffffff');

    const entries = resolveStyleToTokens(
      {
        backgroundColor: '#0f6cbd',
        color: '#ffffff',
      },
      reg,
    );

    expect(entries).toEqual([
      { property: 'backgroundColor', value: '#0f6cbd', tokenPath: 'colors.brandBackground' },
      { property: 'color', value: '#ffffff', tokenPath: 'colors.neutralForegroundOnColor' },
    ]);
  });

  it('omits tokenPath for values that are not registered (literals)', () => {
    const reg = createTokenRegistry();
    reg.register('colors.brandBackground', '#0f6cbd');

    const entries = resolveStyleToTokens(
      {
        backgroundColor: '#0f6cbd',
        // Components frequently apply literal numbers / strings directly.
        paddingHorizontal: 12,
        borderRadius: 4,
      },
      reg,
    );

    expect(entries[0]).toEqual({ property: 'backgroundColor', value: '#0f6cbd', tokenPath: 'colors.brandBackground' });
    expect(entries[1]).toEqual({ property: 'paddingHorizontal', value: 12 });
    expect(entries[2]).toEqual({ property: 'borderRadius', value: 4 });
  });

  it('skips null and undefined values', () => {
    const reg = createTokenRegistry();
    const entries = resolveStyleToTokens(
      {
        width: undefined,
        height: null,
        flex: 1,
      },
      reg,
    );
    expect(entries).toEqual([{ property: 'flex', value: 1 }]);
  });

  it('flattens RN-style arrays with right-most-wins precedence', () => {
    const reg = createTokenRegistry();
    reg.register('colors.brandBackground', '#0f6cbd');
    reg.register('colors.dangerBackground1', '#bc2f32');

    const entries = resolveStyleToTokens(
      [
        { backgroundColor: '#0f6cbd', color: '#000000' },
        { backgroundColor: '#bc2f32' }, // overrides the first
      ],
      reg,
    );

    const byProp = Object.fromEntries(entries.map((e) => [e.property, e]));
    expect(byProp['backgroundColor']).toEqual({
      property: 'backgroundColor',
      value: '#bc2f32',
      tokenPath: 'colors.dangerBackground1',
    });
    expect(byProp['color']).toEqual({ property: 'color', value: '#000000' });
  });

  it('returns [] for empty or nullish input', () => {
    const reg = createTokenRegistry();
    expect(resolveStyleToTokens(null, reg)).toEqual([]);
    expect(resolveStyleToTokens(undefined, reg)).toEqual([]);
    expect(resolveStyleToTokens({}, reg)).toEqual([]);
  });

  it('preserves insertion order', () => {
    const reg = createTokenRegistry();
    const entries = resolveStyleToTokens({ c: 3, a: 1, b: 2 }, reg);
    expect(entries.map((e) => e.property)).toEqual(['c', 'a', 'b']);
  });
});
