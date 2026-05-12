import type { ReactTestRenderer } from 'react-test-renderer';

import { createTokenRegistry } from './tokenRegistry.ts';
import { mapComponentToTokens } from './mapComponentToTokens.ts';

/**
 * Build a `ReactTestRenderer`-shaped stub. Only `toJSON()` is consulted
 * by `mapComponentToTokens`,so we pass the desired payload directly.
 */
function fakeRenderer(payload: unknown): ReactTestRenderer {
  return { toJSON: () => payload } as unknown as ReactTestRenderer;
}

describe('mapComponentToTokens', () => {
  it('handles a multi-root array toJSON() without throwing', () => {
    // When a component returns a fragment, `toJSON()` produces an array.
    // Prior to normalization, `extractStyles / walkTree` would throw on
    // this shape (no `.type`), so this test pins the normalize-first
    // behavior in.
    const renderer = fakeRenderer([
      { type: 'View', props: { testID: 'a', style: { color: 'red' } }, children: null },
      { type: 'View', props: { testID: 'b' }, children: null },
    ]);
    const registry = createTokenRegistry();

    const out = mapComponentToTokens(renderer, registry);

    // Normalized root is a synthetic 'Fragment' containing both children.
    expect(out.component).toBe('Fragment');
    const paths = out.data.slots.map((s) => s.path);
    expect(paths).toEqual([[], [0], [1]]);
    const testIds = out.data.slots.map((s) => s.testID);
    expect(testIds).toEqual([undefined, 'a', 'b']);
  });

  it('handles a single-root toJSON() when children are null', () => {
    // react-test-renderer reports `children: null` for leaf nodes. The
    // walker expects an array, so normalization is the gate.
    const renderer = fakeRenderer({
      type: 'View',
      props: { style: { color: 'red' } },
      children: null,
    });
    const registry = createTokenRegistry();
    const out = mapComponentToTokens(renderer, registry);
    expect(out.component).toBe('View');
    expect(out.data.slots).toHaveLength(1);
  });

});
