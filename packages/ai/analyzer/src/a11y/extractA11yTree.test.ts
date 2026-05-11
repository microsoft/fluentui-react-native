import type { RenderNode } from '../types.ts';
import { extractA11yTree } from './extractA11yTree.ts';

function node(type: string, props: Record<string, unknown> = {}, children: readonly (RenderNode | string)[] = []): RenderNode {
  return { type, props, children };
}

describe('extractA11yTree', () => {
  it('extracts role/label/hint/testID/state from a leaf', () => {
    const root = node('View', {
      accessibilityRole: 'button',
      accessibilityLabel: 'Submit',
      accessibilityHint: 'Submits the form',
      testID: 'submit-btn',
      accessibilityState: { disabled: false, busy: undefined },
    });

    expect(extractA11yTree(root)).toEqual({
      path: [],
      type: 'View',
      role: 'button',
      label: 'Submit',
      hint: 'Submits the form',
      testID: 'submit-btn',
      state: { disabled: false },
      children: [],
    });
  });

  it('drops nodes that contribute no a11y info and have no kept children', () => {
    // Two nested Views with no a11y props and no text children — every
    // node is droppable. The synthesized root is returned empty.
    const root = node('View', {}, [node('View', {})]);
    expect(extractA11yTree(root)).toEqual({
      path: [],
      type: 'View',
      children: [],
    });
  });

  it('keeps Text leaves because their string children are screen-reader content', () => {
    const root = node('View', {}, [node('View', {}, [node('Text', {}, ['plain'])])]);
    const result = extractA11yTree(root);
    expect(result.type).toBe('View');
    expect(result.children).toHaveLength(1);
    expect(result.children[0].children[0]).toMatchObject({
      type: 'Text',
      text: 'plain',
      path: [0, 0],
    });
  });

  it('keeps a structural wrapper that has interactive descendants', () => {
    const interactive = node('View', { accessibilityRole: 'button', accessibilityLabel: 'OK' });
    const wrapper = node('View', {}, [interactive]);

    const result = extractA11yTree(wrapper);

    expect(result.type).toBe('View');
    expect(result.role).toBeUndefined();
    expect(result.children).toHaveLength(1);
    expect(result.children[0]).toMatchObject({
      type: 'View',
      role: 'button',
      label: 'OK',
      path: [0],
    });
  });

  it('drops nodes with accessible={false} and their subtrees', () => {
    const hiddenChild = node('View', {
      accessible: false,
      accessibilityRole: 'button',
      accessibilityLabel: 'Hidden',
    }, [node('Text', {}, ['ignored'])]);

    const visibleChild = node('View', {
      accessibilityRole: 'button',
      accessibilityLabel: 'Visible',
    });

    const root = node('View', { accessibilityRole: 'group', accessibilityLabel: 'Toolbar' }, [hiddenChild, visibleChild]);

    const result = extractA11yTree(root);

    expect(result.children).toHaveLength(1);
    expect(result.children[0]).toMatchObject({ label: 'Visible', path: [1] });
  });

  it('collects string children into `text` on Text nodes only', () => {
    const text = node('Text', { accessibilityRole: 'text' }, ['hello ', 'world']);
    const result = extractA11yTree(text);
    expect(result.text).toBe('hello world');

    const view = node('View', { accessibilityRole: 'button', accessibilityLabel: 'OK' }, ['stray']);
    expect(extractA11yTree(view).text).toBeUndefined();
  });

  it('preserves child indices for paths even when string siblings are present', () => {
    // children = [string, Text]: the Text is at index 1.
    const inner = node('Text', { accessibilityLabel: 'Inner' }, ['inner']);
    const root = node('Text', { accessibilityLabel: 'Outer' }, ['prefix', inner]);

    const result = extractA11yTree(root);
    expect(result.children).toHaveLength(1);
    expect(result.children[0].path).toEqual([1]);
  });

  it('extracts accessibilityValue, dropping undefined keys', () => {
    const root = node('View', {
      accessibilityRole: 'adjustable',
      accessibilityLabel: 'Volume',
      accessibilityValue: { min: 0, max: 100, now: 42, text: undefined },
    });
    expect(extractA11yTree(root).value).toEqual({ min: 0, max: 100, now: 42 });
  });

  it('extracts accessibilityActions', () => {
    const root = node('View', {
      accessibilityRole: 'radio',
      accessibilityLabel: 'Option',
      accessibilityActions: [{ name: 'Select' }, { name: 'activate', label: 'Activate' }],
    });
    expect(extractA11yTree(root).actions).toEqual([
      { name: 'Select' },
      { name: 'activate', label: 'Activate' },
    ]);
  });

  it('omits empty state/value/actions objects', () => {
    const root = node('View', {
      accessibilityRole: 'button',
      accessibilityLabel: 'X',
      accessibilityState: { disabled: undefined, busy: undefined },
      accessibilityValue: { min: undefined, max: undefined, now: undefined, text: undefined },
      accessibilityActions: [],
    });
    const result = extractA11yTree(root);
    expect(result.state).toBeUndefined();
    expect(result.value).toBeUndefined();
    expect(result.actions).toBeUndefined();
  });

  it('handles deeply nested trees with mixed kept/dropped wrappers', () => {
    // Outer wrapper → wrapper2 (dropped) → wrapper3 (kept by descendant) → button (kept)
    const button = node('Pressable', { accessibilityRole: 'button', accessibilityLabel: 'Go' });
    const wrapper3 = node('View', {}, [button]);
    const wrapper2 = node('View', {}, [wrapper3]);
    const root = node('View', { accessibilityRole: 'group', accessibilityLabel: 'Group' }, [wrapper2]);

    const tree = extractA11yTree(root);
    expect(tree.label).toBe('Group');
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0].path).toEqual([0]);
    expect(tree.children[0].children[0].path).toEqual([0, 0]);
    expect(tree.children[0].children[0].children[0]).toMatchObject({
      type: 'Pressable',
      role: 'button',
      label: 'Go',
      path: [0, 0, 0],
    });
  });
});
