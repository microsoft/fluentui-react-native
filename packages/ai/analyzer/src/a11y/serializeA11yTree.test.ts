import type { A11yNode } from './extractA11yTree.ts';
import { serializeA11yTree } from './serializeA11yTree.ts';

describe('serializeA11yTree', () => {
  it('emits keys in alphabetical order regardless of insertion order', () => {
    const tree: A11yNode = {
      type: 'View',
      path: [],
      role: 'button',
      label: 'OK',
      children: [],
    };
    // Reorder by mutating a copy with a different key order.
    const reordered: Record<string, unknown> = {};
    reordered.children = tree.children;
    reordered.role = tree.role;
    reordered.type = tree.type;
    reordered.label = tree.label;
    reordered.path = tree.path;

    const a = serializeA11yTree(tree);
    const b = serializeA11yTree(reordered as unknown as A11yNode);
    expect(a).toBe(b);

    // Verify alphabetical order: children < label < path < role < type.
    const childrenIdx = a.indexOf('"children"');
    const labelIdx = a.indexOf('"label"');
    const pathIdx = a.indexOf('"path"');
    const roleIdx = a.indexOf('"role"');
    const typeIdx = a.indexOf('"type"');
    expect(childrenIdx).toBeLessThan(labelIdx);
    expect(labelIdx).toBeLessThan(pathIdx);
    expect(pathIdx).toBeLessThan(roleIdx);
    expect(roleIdx).toBeLessThan(typeIdx);
  });

  it('skips undefined values entirely', () => {
    const tree = {
      type: 'View',
      path: [],
      role: 'button',
      label: undefined,
      children: [],
    } as unknown as A11yNode;
    const out = serializeA11yTree(tree);
    expect(out).not.toContain('label');
    expect(out).not.toContain('undefined');
  });

  it('indents with two spaces and uses 2-space arrays', () => {
    const tree: A11yNode = {
      type: 'View',
      path: [],
      children: [
        { type: 'Text', path: [0], text: 'hi', children: [] },
      ],
    };
    const out = serializeA11yTree(tree);
    // Top-level object body should be indented two spaces.
    expect(out).toMatch(/\n {2}"children"/);
    // First child object should be indented four spaces (inside the array).
    expect(out).toMatch(/\n {4}\{/);
  });

  it('round-trip stable: parsing then re-serializing yields the same string', () => {
    const tree: A11yNode = {
      type: 'View',
      path: [],
      role: 'button',
      label: 'Submit',
      state: { disabled: false },
      value: { min: 0, max: 10, now: 5 },
      actions: [{ name: 'press', label: 'Press' }],
      children: [
        { type: 'Text', path: [0], text: 'Submit', children: [] },
      ],
    };
    const a = serializeA11yTree(tree);
    const parsed = JSON.parse(a) as A11yNode;
    const b = serializeA11yTree(parsed);
    expect(b).toBe(a);
  });

  it('renders empty arrays and objects inline', () => {
    const tree: A11yNode = {
      type: 'View',
      path: [],
      children: [],
    };
    const out = serializeA11yTree(tree);
    expect(out).toContain('"children": []');
  });

  it('handles numeric path segments and string text correctly', () => {
    const tree: A11yNode = {
      type: 'Text',
      path: [0, 1],
      text: 'hello "world"',
      children: [],
    };
    const out = serializeA11yTree(tree);
    expect(out).toContain('"path": [');
    expect(out).toContain('0,');
    expect(out).toContain('"text": "hello \\"world\\""');
  });

  it('terminates with a single trailing newline', () => {
    const tree: A11yNode = { type: 'View', path: [], children: [] };
    const out = serializeA11yTree(tree);
    expect(out.endsWith('\n')).toBe(true);
    expect(out.endsWith('\n\n')).toBe(false);
  });
});
