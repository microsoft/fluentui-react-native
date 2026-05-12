import type { AnalyzerIssue } from '../types.ts';
import type { A11yNode } from './extractA11yTree.ts';

/**
 * Roles that imply the element is interactive — focusable from a
 * screen reader's perspective and expected to carry an accessible
 * name. Kept narrow and conservative: this list drives both
 * `missing-label` and `nested-interactive` enforcement.
 */
const INTERACTIVE_ROLES = new Set<string>([
  'button',
  'checkbox',
  'link',
  'menuitem',
  'tab',
  'radio',
  'switch',
  'adjustable',
]);

/**
 * Node types that always represent a pressable surface in RN. Used by
 * the `no-role-on-pressable` and `disabled-state-missing` rules.
 */
const PRESSABLE_TYPES = new Set<string>([
  'Pressable',
  'TouchableOpacity',
  'TouchableHighlight',
  'TouchableWithoutFeedback',
  'TouchableNativeFeedback',
]);

/**
 * Contract for a single a11y rule. Rules are small, pure, and easy to
 * add to — each one inspects a node (with its ancestor chain) and
 * returns zero or more issues. The full tree is visited with rules
 * applied to each node by `findA11yIssues`.
 */
export interface A11yRule {
  /** Stable rule id, namespaced as `a11y/<name>`. */
  id: string;
  /** Returns the issues this rule sees on `node`. */
  check(node: A11yNode, ancestors: A11yNode[]): AnalyzerIssue[];
}

/** `a11y/missing-label` — interactive role needs an accessible name. */
const missingLabelRule: A11yRule = {
  id: 'a11y/missing-label',
  check(node) {
    if (node.role === undefined || !INTERACTIVE_ROLES.has(node.role)) {
      return [];
    }
    if (hasAccessibleName(node)) {
      return [];
    }
    return [
      {
        severity: 'error',
        rule: 'a11y/missing-label',
        message: `Node with role "${node.role}" has no accessible name (label, hint, or text child).`,
        path: node.path,
      },
    ];
  },
};

/**
 * `a11y/disabled-state-missing` — an interactive pressable surface
 * where `accessibilityState.disabled` is not declared.
 *
 * Narrowed to "interactive Pressable": we only fire when the node is a
 * pressable type *and* carries one of the interactive roles. Pressables
 * without roles already get `no-role-on-pressable` — double-firing would
 * be noise.
 */
const disabledStateMissingRule: A11yRule = {
  id: 'a11y/disabled-state-missing',
  check(node) {
    if (!PRESSABLE_TYPES.has(node.type)) {
      return [];
    }
    if (node.role === undefined || !INTERACTIVE_ROLES.has(node.role)) {
      return [];
    }
    const disabledKnown = node.state !== undefined && 'disabled' in node.state;
    if (disabledKnown) {
      return [];
    }
    return [
      {
        severity: 'warning',
        rule: 'a11y/disabled-state-missing',
        message: `Interactive pressable (role: "${node.role}") has no \`accessibilityState.disabled\` declared; declare it explicitly so screen readers can announce state changes.`,
        path: node.path,
      },
    ];
  },
};

/** `a11y/nested-interactive` — interactive inside another interactive. */
const nestedInteractiveRule: A11yRule = {
  id: 'a11y/nested-interactive',
  check(node, ancestors) {
    if (node.role === undefined || !INTERACTIVE_ROLES.has(node.role)) {
      return [];
    }
    // Scan from the closest ancestor back to the root so the reported
    // context is the immediate interactive parent — the one a user of
    // the report would find most actionable.
    let closestInteractive: A11yNode | undefined;
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const ancestor = ancestors[i];
      if (ancestor.role !== undefined && INTERACTIVE_ROLES.has(ancestor.role)) {
        closestInteractive = ancestor;
        break;
      }
    }
    if (closestInteractive === undefined) {
      return [];
    }
    return [
      {
        severity: 'error',
        rule: 'a11y/nested-interactive',
        message: `Interactive role "${node.role}" is nested inside closest interactive ancestor role "${closestInteractive.role ?? '<unknown>'}".`,
        path: node.path,
      },
    ];
  },
};

/** `a11y/empty-label` — label is set but empty/whitespace only. */
const emptyLabelRule: A11yRule = {
  id: 'a11y/empty-label',
  check(node) {
    if (node.label === undefined) {
      return [];
    }
    if (node.label.trim() !== '') {
      return [];
    }
    return [
      {
        severity: 'error',
        rule: 'a11y/empty-label',
        message: '`accessibilityLabel` is set but contains no visible text.',
        path: node.path,
      },
    ];
  },
};

/** `a11y/no-role-on-pressable` — Pressable surface with no role. */
const noRoleOnPressableRule: A11yRule = {
  id: 'a11y/no-role-on-pressable',
  check(node) {
    if (!PRESSABLE_TYPES.has(node.type)) {
      return [];
    }
    if (node.role !== undefined) {
      return [];
    }
    return [
      {
        severity: 'warning',
        rule: 'a11y/no-role-on-pressable',
        message: `Node of type "${node.type}" has no \`accessibilityRole\`; screen readers cannot announce its purpose.`,
        path: node.path,
      },
    ];
  },
};

/**
 * `a11y/duplicate-label` is special — it operates on a node's
 * children as a sibling group rather than per-node. We expose it via
 * the same `A11yRule` shape, but the body inspects `node.children`.
 */
const duplicateLabelRule: A11yRule = {
  id: 'a11y/duplicate-label',
  check(node) {
    const seen = new Map<string, A11yNode>();
    const dupes = new Map<string, A11yNode[]>();
    for (const child of node.children) {
      if (child.label === undefined) continue;
      const existing = seen.get(child.label);
      if (existing === undefined) {
        seen.set(child.label, child);
        continue;
      }
      const list = dupes.get(child.label);
      if (list === undefined) {
        dupes.set(child.label, [existing, child]);
      } else {
        list.push(child);
      }
    }
    const issues: AnalyzerIssue[] = [];
    for (const [label, group] of dupes) {
      // Report on every duplicate occurrence after the first, so paths
      // point precisely at the colliding siblings.
      for (let i = 1; i < group.length; i++) {
        issues.push({
          severity: 'warning',
          rule: 'a11y/duplicate-label',
          message: `Sibling nodes share the accessible label "${label}".`,
          path: group[i].path,
        });
      }
    }
    return issues;
  },
};

/**
 * `a11y/header-missing-level` — a header role should declare an
 * accessibilityLevel. RN exposes this as `accessibilityLevel` (translated
 * to accessibility services as the aria-level equivalent). Without it,
 * screen readers can't announce document hierarchy.
 */
const headerMissingLevelRule: A11yRule = {
  id: 'a11y/header-missing-level',
  check(node) {
    if (node.role !== 'header') {
      return [];
    }
    if (node.level !== undefined) {
      return [];
    }
    return [
      {
        severity: 'warning',
        rule: 'a11y/header-missing-level',
        message: 'Node with role "header" has no `accessibilityLevel` declared; screen readers cannot announce document hierarchy without it.',
        path: node.path,
      },
    ];
  },
};

/** `a11y/image-missing-label` — image role without a label or text. */
const imageMissingLabelRule: A11yRule = {
  id: 'a11y/image-missing-label',
  check(node) {
    if (node.role !== 'image') {
      return [];
    }
    const hasLabel = node.label !== undefined && node.label.trim() !== '';
    const hasText = node.text !== undefined && node.text.trim() !== '';
    if (hasLabel || hasText) {
      return [];
    }
    return [
      {
        severity: 'error',
        rule: 'a11y/image-missing-label',
        message: 'Node with role "image" has no `accessibilityLabel` or text; screen readers cannot describe it.',
        path: node.path,
      },
    ];
  },
};

/** `a11y/adjustable-missing-value` — adjustable role without accessibilityValue. */
const adjustableMissingValueRule: A11yRule = {
  id: 'a11y/adjustable-missing-value',
  check(node) {
    if (node.role !== 'adjustable') {
      return [];
    }
    if (node.value !== undefined) {
      return [];
    }
    return [
      {
        severity: 'warning',
        rule: 'a11y/adjustable-missing-value',
        message: 'Node with role "adjustable" has no `accessibilityValue`; screen readers cannot announce the current value.',
        path: node.path,
      },
    ];
  },
};

/** `a11y/tab-missing-selected` — tab whose state has no `selected` key. */
const tabMissingSelectedRule: A11yRule = {
  id: 'a11y/tab-missing-selected',
  check(node) {
    if (node.role !== 'tab') {
      return [];
    }
    if (node.state !== undefined && 'selected' in node.state) {
      return [];
    }
    return [
      {
        severity: 'warning',
        rule: 'a11y/tab-missing-selected',
        message: 'Node with role "tab" has no `accessibilityState.selected`; screen readers cannot announce which tab is current.',
        path: node.path,
      },
    ];
  },
};

/**
 * Default rule set shipped with the analyzer. Consumers can pass a
 * custom array (or this one filtered/extended) to `findA11yIssues`.
 */
export const defaultA11yRules: A11yRule[] = [
  missingLabelRule,
  disabledStateMissingRule,
  nestedInteractiveRule,
  duplicateLabelRule,
  emptyLabelRule,
  noRoleOnPressableRule,
  headerMissingLevelRule,
  imageMissingLabelRule,
  adjustableMissingValueRule,
  tabMissingSelectedRule,
];

/**
 * Run a set of a11y rules over an `A11yNode` tree. Each rule sees
 * every node together with its ancestor chain (root first, closest
 * parent last). Issues are returned in document order.
 */
export function findA11yIssues(tree: A11yNode, rules: A11yRule[] = defaultA11yRules): AnalyzerIssue[] {
  const issues: AnalyzerIssue[] = [];
  visit(tree, [], rules, issues);
  return issues;
}

function visit(node: A11yNode, ancestors: A11yNode[], rules: A11yRule[], out: AnalyzerIssue[]): void {
  for (const rule of rules) {
    const ruleIssues = rule.check(node, ancestors);
    for (const issue of ruleIssues) {
      out.push(issue);
    }
  }
  const nextAncestors = [...ancestors, node];
  for (const child of node.children) {
    visit(child, nextAncestors, rules, out);
  }
}

function hasAccessibleName(node: A11yNode): boolean {
  if (node.label !== undefined && node.label.trim() !== '') return true;
  if (node.hint !== undefined && node.hint.trim() !== '') return true;
  if (node.text !== undefined && node.text.trim() !== '') return true;
  // A nested text child also provides a name for the role.
  return hasTextDescendant(node);
}

function hasTextDescendant(node: A11yNode): boolean {
  for (const child of node.children) {
    if (child.text !== undefined && child.text.trim() !== '') return true;
    if (hasTextDescendant(child)) return true;
  }
  return false;
}
