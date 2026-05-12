import type { RenderNode } from '../types.ts';
import { serializeRenderTree } from './serializeRenderTree.ts';

describe('serializeRenderTree', () => {
  it('produces stable alpha-ordered JSON with trailing newline', () => {
    const tree: RenderNode = {
      type: 'View',
      props: { testID: 'root', style: { color: 'red' } },
      children: [
        {
          type: 'Text',
          props: {},
          children: ['hi'],
        },
      ],
    };
    const json = serializeRenderTree(tree);
    expect(json.endsWith('\n')).toBe(true);
    // Parse and compare semantically: keys must survive the round-trip.
    expect(JSON.parse(json)).toEqual({
      type: 'View',
      props: { testID: 'root', style: { color: 'red' } },
      children: [{ type: 'Text', props: {}, children: ['hi'] }],
    });
  });

  it('skips undefined prop values and alpha-sorts keys', () => {
    const tree: RenderNode = {
      type: 'View',
      props: { b: 1, a: 2, zero: undefined },
      children: [],
    };
    const json = serializeRenderTree(tree);
    // The `zero` prop had the value undefined - the serializer must drop it.
    expect(json).not.toMatch(/zero/);
    // And the props object keys must appear in alphabetical order (a before b).
    const parsed = JSON.parse(json);
    expect(parsed.props).toEqual({ a: 2, b: 1 });
    // Check textual order explicitly: `"a"` should appear before `"b"`.
    const aIdx = json.indexOf('"a"');
    const bIdx = json.indexOf('"b"');
    expect(aIdx).toBeLessThan(bIdx);
  });

  it('round-trips empty children and empty props', () => {
    const tree: RenderNode = { type: 'Empty', props: {}, children: [] };
    const json = serializeRenderTree(tree);
    expect(JSON.parse(json)).toEqual(tree);
  });
});
