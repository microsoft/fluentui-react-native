import type { ComponentTokens } from './ComponentTokens.ts';
import { resolveTokensForState } from './resolveTokens.ts';

const baseTokens: ComponentTokens = {
  component: 'Button',
  platform: 'default',
  layers: {
    backgroundColor: { kind: 'theme', path: 'colors.buttonBackground' },
    borderRadius: { kind: 'global', path: 'corner.radius40' },
    iconSize: { kind: 'constant', value: 16 },
    hovered: {
      backgroundColor: { kind: 'theme', path: 'colors.defaultHoveredBackground' },
    },
    primary: {
      backgroundColor: { kind: 'theme', path: 'colors.brandBackground' },
      hovered: {
        backgroundColor: { kind: 'theme', path: 'colors.brandBackgroundHover' },
      },
    },
    medium: {
      padding: {
        kind: 'expression',
        op: '-',
        operands: [
          { kind: 'global', path: 'size60' },
          { kind: 'global', path: 'stroke.width10' },
        ],
      },
    },
  },
};

describe('resolveTokensForState', () => {
  it('returns only base leaves when no layers are active', () => {
    const resolved = resolveTokensForState(baseTokens, []);
    expect(resolved).toEqual({
      backgroundColor: { kind: 'theme', path: 'colors.buttonBackground' },
      borderRadius: { kind: 'global', path: 'corner.radius40' },
      iconSize: { kind: 'constant', value: 16 },
    });
  });

  it('overrides base values from a single active layer', () => {
    const resolved = resolveTokensForState(baseTokens, ['hovered']);
    expect(resolved.backgroundColor).toEqual({ kind: 'theme', path: 'colors.defaultHoveredBackground' });
    expect(resolved.iconSize).toEqual({ kind: 'constant', value: 16 });
  });

  it('recurses into nested layers (primary.hovered)', () => {
    const resolved = resolveTokensForState(baseTokens, ['primary', 'hovered']);
    expect(resolved.backgroundColor).toEqual({ kind: 'theme', path: 'colors.brandBackgroundHover' });
  });

  it('merges multiple documents in order, later overriding earlier', () => {
    const override: ComponentTokens = {
      component: 'Button',
      platform: 'android',
      layers: {
        // Sparse: only this leaf differs from the default.
        backgroundColor: { kind: 'theme', path: 'colors.androidButtonBackground' },
      },
    };
    const resolved = resolveTokensForState([baseTokens, override], []);
    expect(resolved.backgroundColor).toEqual({ kind: 'theme', path: 'colors.androidButtonBackground' });
    // Tokens not in the override still come from base.
    expect(resolved.iconSize).toEqual({ kind: 'constant', value: 16 });
  });

  it('preserves expression sources verbatim', () => {
    const resolved = resolveTokensForState(baseTokens, ['medium']);
    expect(resolved.padding).toEqual({
      kind: 'expression',
      op: '-',
      operands: [
        { kind: 'global', path: 'size60' },
        { kind: 'global', path: 'stroke.width10' },
      ],
    });
  });

  it('ignores sub-layers whose name is not in activeLayers', () => {
    const resolved = resolveTokensForState(baseTokens, ['primary']);
    // primary is active, hovered is not, so primary.hovered doesn't apply.
    expect(resolved.backgroundColor).toEqual({ kind: 'theme', path: 'colors.brandBackground' });
  });
});
