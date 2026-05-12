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

  it('reaches into an object value and attributes per-leaf', () => {
    // `shadowOffset` is the candidate case: RN's actual resolved style
    // carries `{ width, height }` and the width/height can be registered
    // independently.
    const reg = createTokenRegistry();
    reg.register('shadows.shadow2.ambient.x', 42);
    reg.register('shadows.shadow2.ambient.y', 43);

    const entries = resolveStyleToTokens({ shadowOffset: { width: 42, height: 43 } }, reg);

    expect(entries).toHaveLength(1);
    expect(entries[0].property).toBe('shadowOffset');
    expect(entries[0].tokenPath).toBeUndefined();
    expect(entries[0].children).toEqual([
      { property: 'width', value: 42, tokenPath: 'shadows.shadow2.ambient.x' },
      { property: 'height', value: 43, tokenPath: 'shadows.shadow2.ambient.y' },
    ]);
  });

  it('reaches into an array value using stringified indices', () => {
    const reg = createTokenRegistry();
    const translateXSentinel = { translateX: '__trX' };
    reg.register('transform.trInternal', translateXSentinel);

    const entries = resolveStyleToTokens({ transform: [translateXSentinel] }, reg);

    expect(entries).toHaveLength(1);
    expect(entries[0].property).toBe('transform');
    expect(entries[0].children).toHaveLength(1);
    expect(entries[0].children![0]).toMatchObject({ property: '0', tokenPath: 'transform.trInternal' });
  });

  it('keeps an object-level tokenPath when the whole value is registered', () => {
    // Variant spread: the whole variant is registered, and so are its
    // fields. The value-level path wins and children are still populated.
    const reg = createTokenRegistry();
    const variant = { size: 12, lineHeight: 14 };
    reg.register('typography.variants.body', variant);
    reg.register('typography.variants.body.size', 12);
    reg.register('typography.variants.body.lineHeight', 14);

    const entries = resolveStyleToTokens({ font: variant }, reg);

    expect(entries).toHaveLength(1);
    expect(entries[0].tokenPath).toBe('typography.variants.body');
    expect(entries[0].children).toEqual([
      { property: 'size', value: 12, tokenPath: 'typography.variants.body.size' },
      { property: 'lineHeight', value: 14, tokenPath: 'typography.variants.body.lineHeight' },
    ]);
  });

  it('does not attach children when no descendant matches', () => {
    // Unregistered object values: we emit a plain entry with no
    // `tokenPath` and no `children` so the snapshot isn't cluttered with
    // empty attribution fields.
    const reg = createTokenRegistry();
    const entries = resolveStyleToTokens({ shadowOffset: { width: 1, height: 2 } }, reg);
    expect(entries).toEqual([{ property: 'shadowOffset', value: { width: 1, height: 2 } }]);
  });
});
