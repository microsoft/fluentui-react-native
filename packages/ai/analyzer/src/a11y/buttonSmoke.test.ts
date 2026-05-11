import type { RenderNode } from '../types.ts';
import { extractA11yTree } from './extractA11yTree.ts';
import { findA11yIssues } from './findA11yIssues.ts';
import { serializeA11yTree } from './serializeA11yTree.ts';

/**
 * End-to-end smoke test for the a11y pipeline. Mirrors the actual
 * shape `react-test-renderer` produces for `<Button>Click me</Button>`
 * — see `packages/components/Button/src/__snapshots__/Button.test.tsx.snap`.
 *
 * Using a literal here keeps this test independent of the FluentUI
 * Button package and free of theming/rendering setup. The brief
 * permits this approach explicitly.
 */
function buttonRender(): RenderNode {
  return {
    type: 'View',
    props: {
      accessibilityLabel: 'Click me',
      accessibilityRole: 'button',
      accessibilityState: {
        busy: undefined,
        checked: undefined,
        disabled: false,
        expanded: undefined,
        selected: undefined,
      },
      accessibilityValue: {
        max: undefined,
        min: undefined,
        now: undefined,
        text: undefined,
      },
      accessible: true,
      collapsable: false,
      focusable: true,
      style: {},
    },
    children: [
      {
        type: 'Text',
        props: {
          accessible: false,
          ellipsizeMode: 'tail',
          numberOfLines: 0,
          style: {},
        },
        children: ['Click me'],
      },
    ],
  };
}

describe('end-to-end: Button-shaped tree', () => {
  it('extracts a clean a11y tree with the Text child dropped (accessible={false})', () => {
    const tree = extractA11yTree(buttonRender());
    expect(tree).toMatchObject({
      type: 'View',
      role: 'button',
      label: 'Click me',
      state: { disabled: false },
      children: [],
    });
    // The inner Text has accessible={false}, so it must not appear.
    expect(tree.children).toHaveLength(0);
  });

  it('serializes to stable JSON', () => {
    const tree = extractA11yTree(buttonRender());
    const json = serializeA11yTree(tree);
    expect(JSON.parse(json)).toEqual(tree);
    // Snapshot value, not the full file — easier to diff:
    expect(json).toBe(
      [
        '{',
        '  "children": [],',
        '  "label": "Click me",',
        '  "path": [],',
        '  "role": "button",',
        '  "state": {',
        '    "disabled": false',
        '  },',
        '  "type": "View"',
        '}',
        '',
      ].join('\n'),
    );
  });

  it('reports no issues from the default rules for a labelled button', () => {
    const tree = extractA11yTree(buttonRender());
    const issues = findA11yIssues(tree);
    expect(issues).toEqual([]);
  });
});
