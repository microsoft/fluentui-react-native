import type { RenderNode, SlotPath } from '../types.ts';
import { walkTree } from './walk.ts';

function leaf(type: string, props: Record<string, unknown> = {}): RenderNode {
  return { type, props, children: [] };
}

describe('walkTree', () => {
  it('visits a single leaf node with an empty path', () => {
    const root = leaf('View');
    const visited: { type: string; path: SlotPath }[] = [];

    walkTree(root, (node, path) => {
      visited.push({ type: node.type, path });
    });

    expect(visited).toEqual([{ type: 'View', path: [] }]);
  });

  it('skips string children but preserves their index positions', () => {
    // Tree:
    //   Text
    //   ├── "hello"    (index 0, string)
    //   ├── Bold       (index 1, node)
    //   └── "world"    (index 2, string)
    const bold = leaf('Bold');
    const root: RenderNode = {
      type: 'Text',
      props: {},
      children: ['hello', bold, 'world'],
    };

    const visited: { type: string; path: SlotPath }[] = [];
    walkTree(root, (node, path) => {
      visited.push({ type: node.type, path });
    });

    expect(visited).toEqual([
      { type: 'Text', path: [] },
      // Bold sits at original index 1 in children, so the path is [1]
      { type: 'Bold', path: [1] },
    ]);
  });

  it('walks nested trees in depth-first pre-order with correct indices', () => {
    // Tree:
    //   Root
    //   ├── A          (path [0])
    //   │   ├── A1     (path [0, 0])
    //   │   └── A2     (path [0, 1])
    //   └── B          (path [1])
    //       └── B1     (path [1, 0])
    const a1 = leaf('A1');
    const a2 = leaf('A2');
    const a: RenderNode = { type: 'A', props: {}, children: [a1, a2] };
    const b1 = leaf('B1');
    const b: RenderNode = { type: 'B', props: {}, children: [b1] };
    const root: RenderNode = { type: 'Root', props: {}, children: [a, b] };

    const visited: { type: string; path: SlotPath }[] = [];
    walkTree(root, (node, path) => {
      visited.push({ type: node.type, path });
    });

    expect(visited).toEqual([
      { type: 'Root', path: [] },
      { type: 'A', path: [0] },
      { type: 'A1', path: [0, 0] },
      { type: 'A2', path: [0, 1] },
      { type: 'B', path: [1] },
      { type: 'B1', path: [1, 0] },
    ]);
  });

  it('uses the original child index even when string siblings come before nodes', () => {
    // Index 0 is a string, index 1 is a node — the node's path must be [1].
    const child = leaf('Child');
    const root: RenderNode = {
      type: 'Mixed',
      props: {},
      children: ['leading text', child],
    };

    const paths: SlotPath[] = [];
    walkTree(root, (_, path) => {
      paths.push(path);
    });

    expect(paths).toEqual([[], [1]]);
  });
});
