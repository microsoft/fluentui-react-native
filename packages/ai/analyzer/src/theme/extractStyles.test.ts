import type { RenderNode } from '../types.ts';
import { extractStyles } from './extractStyles.ts';

function makeNode(type: string, props: Record<string, unknown>, children: (RenderNode | string)[] = []): RenderNode {
  return { type, props, children };
}

describe('extractStyles', () => {
  it('emits one entry per node with style + testID preserved', () => {
    const tree = makeNode('View', { style: { backgroundColor: 'red' }, testID: 'root' }, [
      makeNode('Text', { style: { color: 'white' } }, ['Hello']),
    ]);

    const entries = extractStyles(tree);
    expect(entries).toEqual([
      { path: [], type: 'View', testID: 'root', style: { backgroundColor: 'red' } },
      { path: [0], type: 'Text', style: { color: 'white' } },
    ]);
  });

  it('emits nodes without a style prop with style:undefined', () => {
    const tree = makeNode('View', { testID: 'root' }, [makeNode('Text', {}, ['Hi'])]);
    const entries = extractStyles(tree);
    expect(entries[0].style).toBeUndefined();
    expect(entries[1].style).toBeUndefined();
  });

  it('paths correspond to original child indices including those skipped by string children', () => {
    // walkTree skips string children but still consumes their index, so a
    // <Text> with children ['hi', BoldNode] reports BoldNode at path [1].
    // The brief spells this out and we replicate it here so extractStyles
    // is verified against the documented contract.
    const tree = makeNode('Text', { style: { color: 'black' } }, [
      'hi',
      makeNode('Bold', { style: { fontWeight: 'bold' } }, ['world']),
    ]);
    const entries = extractStyles(tree);
    expect(entries).toHaveLength(2);
    expect(entries[1]).toEqual({ path: [1], type: 'Bold', style: { fontWeight: 'bold' } });
  });

  it('passes array styles through untouched for downstream flattening', () => {
    const arr = [{ a: 1 }, { b: 2 }];
    const tree = makeNode('View', { style: arr }, []);
    const entries = extractStyles(tree);
    expect(entries[0].style).toBe(arr);
  });

  it('normalizes non-object style props to undefined', () => {
    // RN sometimes carries a numeric style ID (registered style). Without
    // a registry to resolve it we can't usefully reverse-map; downstream
    // code should not have to handle this case, so we normalize here.
    const tree = makeNode('View', { style: 42 }, []);
    const entries = extractStyles(tree);
    expect(entries[0].style).toBeUndefined();
  });
});
