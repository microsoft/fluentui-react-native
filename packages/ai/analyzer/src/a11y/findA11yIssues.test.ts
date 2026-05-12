import type { A11yNode } from './extractA11yTree.ts';
import { defaultA11yRules, findA11yIssues, type A11yRule } from './findA11yIssues.ts';

function leaf(overrides: Partial<A11yNode> & { type: string }): A11yNode {
  return { path: [], children: [], ...overrides };
}

function ruleById(id: string): A11yRule {
  const found = defaultA11yRules.find((rule) => rule.id === id);
  if (found === undefined) {
    throw new Error(`Rule not registered: ${id}`);
  }
  return found;
}

describe('findA11yIssues', () => {
  describe('a11y/missing-label', () => {
    const rule = ruleById('a11y/missing-label');

    it('flags an interactive role with no name', () => {
      const tree = leaf({ type: 'View', role: 'button' });
      const issues = findA11yIssues(tree, [rule]);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({ severity: 'error', rule: 'a11y/missing-label', path: [] });
    });

    it('does not flag when a label is provided', () => {
      const tree = leaf({ type: 'View', role: 'button', label: 'OK' });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });

    it('does not flag when a text child provides the name', () => {
      const child: A11yNode = { type: 'Text', path: [0], text: 'OK', children: [] };
      const tree: A11yNode = { type: 'View', path: [], role: 'button', children: [child] };
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });

    it('does not flag non-interactive roles', () => {
      const tree = leaf({ type: 'View', role: 'header' });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });
  });

  describe('a11y/disabled-state-missing', () => {
    const rule = ruleById('a11y/disabled-state-missing');

    it('flags an interactive Pressable with no disabled state declared', () => {
      const tree = leaf({ type: 'Pressable', role: 'button', label: 'X' });
      const issues = findA11yIssues(tree, [rule]);
      expect(issues).toHaveLength(1);
      expect(issues[0].rule).toBe('a11y/disabled-state-missing');
    });

    it('does not flag a Pressable that declares disabled', () => {
      const tree = leaf({ type: 'Pressable', role: 'button', label: 'X', state: { disabled: false } });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });

    it('does not flag a Pressable without an interactive role', () => {
      // No role (or a non-interactive role) means `no-role-on-pressable`
      // will cover the issue instead — don't double-fire.
      const tree = leaf({ type: 'Pressable', testID: 'x' });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });

    it('does not flag non-pressable types', () => {
      const tree = leaf({ type: 'View', role: 'button', label: 'X' });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });
  });

  describe('a11y/nested-interactive', () => {
    const rule = ruleById('a11y/nested-interactive');

    it('flags an interactive node nested inside another interactive node', () => {
      const inner: A11yNode = { type: 'View', path: [0], role: 'button', label: 'Inner', children: [] };
      const outer: A11yNode = { type: 'View', path: [], role: 'button', label: 'Outer', children: [inner] };
      const issues = findA11yIssues(outer, [rule]);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({ rule: 'a11y/nested-interactive', path: [0], severity: 'error' });
    });

    it('reports the closest interactive ancestor, not the root', () => {
      // Three levels deep: button > checkbox > link. The rule should
      // name the closest (checkbox), not the farthest (button).
      const deep: A11yNode = { type: 'View', path: [0, 0], role: 'link', label: 'L', children: [] };
      const mid: A11yNode = { type: 'View', path: [0], role: 'checkbox', label: 'C', children: [deep] };
      const root: A11yNode = { type: 'View', path: [], role: 'button', label: 'B', children: [mid] };
      const issues = findA11yIssues(root, [rule]);
      // Two nesting issues: checkbox under button, link under checkbox.
      const forLink = issues.find((i) => Array.isArray(i.path) && i.path[0] === 0 && i.path[1] === 0);
      expect(forLink).toBeDefined();
      expect(forLink!.message).toContain('checkbox');
      expect(forLink!.message).not.toContain('button');
    });

    it('does not flag a single interactive node', () => {
      const tree = leaf({ type: 'View', role: 'button', label: 'X' });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });

    it('does not flag interactive sibling pairs (not nested)', () => {
      const a: A11yNode = { type: 'View', path: [0], role: 'button', label: 'A', children: [] };
      const b: A11yNode = { type: 'View', path: [1], role: 'button', label: 'B', children: [] };
      const root: A11yNode = { type: 'View', path: [], role: 'group', label: 'Group', children: [a, b] };
      expect(findA11yIssues(root, [rule])).toEqual([]);
    });
  });

  describe('a11y/duplicate-label', () => {
    const rule = ruleById('a11y/duplicate-label');

    it('flags sibling nodes with identical labels', () => {
      const a: A11yNode = { type: 'View', path: [0], role: 'button', label: 'Save', children: [] };
      const b: A11yNode = { type: 'View', path: [1], role: 'button', label: 'Save', children: [] };
      const root: A11yNode = { type: 'View', path: [], children: [a, b] };
      const issues = findA11yIssues(root, [rule]);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({ rule: 'a11y/duplicate-label', path: [1], severity: 'warning' });
    });

    it('does not flag distinct sibling labels', () => {
      const a: A11yNode = { type: 'View', path: [0], role: 'button', label: 'Save', children: [] };
      const b: A11yNode = { type: 'View', path: [1], role: 'button', label: 'Cancel', children: [] };
      const root: A11yNode = { type: 'View', path: [], children: [a, b] };
      expect(findA11yIssues(root, [rule])).toEqual([]);
    });
  });

  describe('a11y/empty-label', () => {
    const rule = ruleById('a11y/empty-label');

    it('flags an empty label', () => {
      const tree = leaf({ type: 'View', role: 'button', label: '' });
      const issues = findA11yIssues(tree, [rule]);
      expect(issues).toHaveLength(1);
      expect(issues[0].rule).toBe('a11y/empty-label');
    });

    it('flags a whitespace-only label', () => {
      const tree = leaf({ type: 'View', role: 'button', label: '   \t' });
      expect(findA11yIssues(tree, [rule])).toHaveLength(1);
    });

    it('does not flag a non-empty label', () => {
      const tree = leaf({ type: 'View', role: 'button', label: 'OK' });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });

    it('does not flag a missing label', () => {
      const tree = leaf({ type: 'View', role: 'button' });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });
  });

  describe('a11y/no-role-on-pressable', () => {
    const rule = ruleById('a11y/no-role-on-pressable');

    it('flags a Pressable without a role', () => {
      const tree = leaf({ type: 'Pressable', testID: 'press-me' });
      const issues = findA11yIssues(tree, [rule]);
      expect(issues).toHaveLength(1);
      expect(issues[0].rule).toBe('a11y/no-role-on-pressable');
    });

    it('flags a TouchableOpacity without a role', () => {
      const tree = leaf({ type: 'TouchableOpacity', label: 'Tap' });
      expect(findA11yIssues(tree, [rule])).toHaveLength(1);
    });

    it('does not flag a Pressable with a role', () => {
      const tree = leaf({ type: 'Pressable', role: 'button', label: 'X' });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });

    it('does not flag a non-pressable type', () => {
      const tree = leaf({ type: 'View', testID: 'x' });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });
  });

  describe('a11y/header-missing-level', () => {
    const rule = ruleById('a11y/header-missing-level');

    it('flags a header with no level', () => {
      const tree = leaf({ type: 'View', role: 'header', label: 'Section' });
      const issues = findA11yIssues(tree, [rule]);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({ rule: 'a11y/header-missing-level', severity: 'warning' });
    });

    it('does not flag a header with a level', () => {
      const tree = leaf({ type: 'View', role: 'header', label: 'S', level: 2 });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });

    it('does not flag non-header roles', () => {
      const tree = leaf({ type: 'View', role: 'button', label: 'B' });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });
  });

  describe('a11y/image-missing-label', () => {
    const rule = ruleById('a11y/image-missing-label');

    it('flags an image without label or text', () => {
      const tree = leaf({ type: 'Image', role: 'image' });
      const issues = findA11yIssues(tree, [rule]);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({ rule: 'a11y/image-missing-label', severity: 'error' });
    });

    it('does not flag an image with a label', () => {
      const tree = leaf({ type: 'Image', role: 'image', label: 'the cat is in the hat' });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });
  });

  describe('a11y/adjustable-missing-value', () => {
    const rule = ruleById('a11y/adjustable-missing-value');

    it('flags an adjustable without accessibilityValue', () => {
      const tree = leaf({ type: 'View', role: 'adjustable', label: 'Volume' });
      const issues = findA11yIssues(tree, [rule]);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({ rule: 'a11y/adjustable-missing-value', severity: 'warning' });
    });

    it('does not flag an adjustable with a value', () => {
      const tree = leaf({ type: 'View', role: 'adjustable', label: 'Volume', value: { now: 50 } });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });
  });

  describe('a11y/tab-missing-selected', () => {
    const rule = ruleById('a11y/tab-missing-selected');

    it('flags a tab without a selected state', () => {
      const tree = leaf({ type: 'View', role: 'tab', label: 'Tab1' });
      const issues = findA11yIssues(tree, [rule]);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({ rule: 'a11y/tab-missing-selected', severity: 'warning' });
    });

    it('does not flag a tab with a selected state', () => {
      const tree = leaf({ type: 'View', role: 'tab', label: 'Tab1', state: { selected: true } });
      expect(findA11yIssues(tree, [rule])).toEqual([]);
    });
  });

  describe('default rule set', () => {
    it('runs all rules in document order and aggregates results', () => {
      const child: A11yNode = {
        type: 'View',
        path: [0],
        role: 'checkbox',
        children: [], // no label -> missing-label
      };
      const root: A11yNode = {
        type: 'Pressable',
        path: [],
        // type=Pressable, no role -> no-role-on-pressable (not disabled-state-missing).
        children: [child],
      };
      const issues = findA11yIssues(root);
      const rules = issues.map((issue) => issue.rule).sort();
      // No disabled-state-missing fires — the Pressable has no interactive
      // role, so no-role-on-pressable covers the issue instead.
      expect(rules).toEqual([
        'a11y/missing-label',
        'a11y/no-role-on-pressable',
      ]);
    });

    it('does not double-fire on a roleless Pressable (only no-role-on-pressable fires)', () => {
      const pressable: A11yNode = { type: 'Pressable', path: [], testID: 'root', children: [] };
      const issues = findA11yIssues(pressable);
      const disabled = issues.filter((i) => i.rule === 'a11y/disabled-state-missing');
      const noRole = issues.filter((i) => i.rule === 'a11y/no-role-on-pressable');
      expect(disabled).toEqual([]);
      expect(noRole).toHaveLength(1);
    });

    it('accepts a custom rule injected by the caller', () => {
      const custom: A11yRule = {
        id: 'a11y/custom',
        check(node) {
          return node.type === 'View'
            ? [{ severity: 'info', rule: 'a11y/custom', message: 'saw a View', path: node.path }]
            : [];
        },
      };
      const tree = leaf({ type: 'View' });
      const issues = findA11yIssues(tree, [custom]);
      expect(issues).toHaveLength(1);
      expect(issues[0].rule).toBe('a11y/custom');
    });
  });
});
