import type { RenderNode, SlotPath } from '../types.ts';

/**
 * A node in the simplified accessibility tree extracted from a
 * `RenderNode`. Each `A11yNode` mirrors the a11y-relevant subset of
 * props from React Native's a11y prop set. Optional fields are omitted
 * when the underlying prop is missing or empty — snapshots stay small
 * and reviews stay focused on real signal.
 *
 * New fields should be added conservatively, since the structure ships
 * directly into checked-in snapshots.
 */
export interface A11yNode {
  /** Index path from the rendered root, as produced by `walkTree`. */
  path: SlotPath;
  /** Render node `type`, e.g. `'View'`, `'Text'`, `'Pressable'`. */
  type: string;
  /** `accessibilityRole` if set. */
  role?: string;
  /** `accessibilityLabel` if set. */
  label?: string;
  /** `accessibilityHint` if set. */
  hint?: string;
  /** `accessibilityState` with `undefined` keys filtered out. */
  state?: Record<string, boolean>;
  /** `accessibilityValue` with `undefined` keys filtered out. */
  value?: { min?: number; max?: number; now?: number; text?: string };
  /** `accessibilityActions` if any actions are declared. */
  actions?: { name: string; label?: string }[];
  /** Concatenated string children. Set on text-bearing nodes only. */
  text?: string;
  /** `testID` if set. */
  testID?: string;
  /** Kept children, in the order they appear in the source tree. */
  children: A11yNode[];
}

interface A11yInfo {
  role?: string;
  label?: string;
  hint?: string;
  state?: Record<string, boolean>;
  value?: { min?: number; max?: number; now?: number; text?: string };
  actions?: { name: string; label?: string }[];
  text?: string;
  testID?: string;
}

/**
 * Reduce a rendered `RenderNode` tree to an accessibility-only tree.
 *
 * Walks the tree depth-first. For each node:
 *
 * 1. If `accessible === false`, the node and its entire subtree are
 *    dropped — RN hides such nodes from the a11y tree at runtime.
 * 2. Otherwise, the node's a11y-relevant props are extracted.
 * 3. A node is dropped (collapsed) when it has none of:
 *    role, label, hint, state, value, actions, text, testID — *and*
 *    every child has also been dropped. Otherwise it is kept.
 *
 * Because dropping is bottom-up, a structural wrapper that has no a11y
 * info of its own can still be kept when it holds interactive
 * descendants — those descendants surface as direct children of the
 * wrapper in the resulting tree.
 *
 * The returned root always exists (callers pass a non-empty root); when
 * a root would otherwise be dropped, it is preserved so consumers
 * always have a stable anchor for `path: []`.
 */
export function extractA11yTree(root: RenderNode): A11yNode {
  const result = extract(root, []);
  if (result !== null) {
    return result;
  }
  // The root contributes nothing and has no kept descendants — synthesize
  // an empty placeholder so consumers always receive a non-null tree.
  return { path: [], type: root.type, children: [] };
}

function extract(node: RenderNode, path: SlotPath): A11yNode | null {
  if (node.props.accessible === false) {
    return null;
  }

  const info = collectA11yInfo(node);
  const children = collectChildren(node, path);

  if (!hasA11yInfo(info) && children.length === 0) {
    return null;
  }

  const a11yNode: A11yNode = { path, type: node.type, children };
  if (info.role !== undefined) a11yNode.role = info.role;
  if (info.label !== undefined) a11yNode.label = info.label;
  if (info.hint !== undefined) a11yNode.hint = info.hint;
  if (info.state !== undefined) a11yNode.state = info.state;
  if (info.value !== undefined) a11yNode.value = info.value;
  if (info.actions !== undefined) a11yNode.actions = info.actions;
  if (info.text !== undefined) a11yNode.text = info.text;
  if (info.testID !== undefined) a11yNode.testID = info.testID;
  return a11yNode;
}

function collectChildren(node: RenderNode, path: SlotPath): A11yNode[] {
  const out: A11yNode[] = [];
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (typeof child === 'string') {
      continue;
    }
    const childA11y = extract(child, [...path, i]);
    if (childA11y !== null) {
      out.push(childA11y);
    }
  }
  return out;
}

function collectA11yInfo(node: RenderNode): A11yInfo {
  const info: A11yInfo = {};
  const props = node.props;

  if (typeof props.accessibilityRole === 'string') {
    info.role = props.accessibilityRole;
  }
  if (typeof props.accessibilityLabel === 'string') {
    info.label = props.accessibilityLabel;
  }
  if (typeof props.accessibilityHint === 'string') {
    info.hint = props.accessibilityHint;
  }
  if (typeof props.testID === 'string') {
    info.testID = props.testID;
  }

  const stateRaw = props.accessibilityState;
  if (stateRaw && typeof stateRaw === 'object') {
    const state: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(stateRaw as Record<string, unknown>)) {
      if (typeof value === 'boolean') {
        state[key] = value;
      }
    }
    if (Object.keys(state).length > 0) {
      info.state = state;
    }
  }

  const valueRaw = props.accessibilityValue;
  if (valueRaw && typeof valueRaw === 'object') {
    const value: { min?: number; max?: number; now?: number; text?: string } = {};
    const src = valueRaw as Record<string, unknown>;
    if (typeof src.min === 'number') value.min = src.min;
    if (typeof src.max === 'number') value.max = src.max;
    if (typeof src.now === 'number') value.now = src.now;
    if (typeof src.text === 'string') value.text = src.text;
    if (Object.keys(value).length > 0) {
      info.value = value;
    }
  }

  const actionsRaw = props.accessibilityActions;
  if (Array.isArray(actionsRaw)) {
    const actions: { name: string; label?: string }[] = [];
    for (const action of actionsRaw) {
      if (action && typeof action === 'object') {
        const src = action as Record<string, unknown>;
        if (typeof src.name === 'string') {
          const entry: { name: string; label?: string } = { name: src.name };
          if (typeof src.label === 'string') {
            entry.label = src.label;
          }
          actions.push(entry);
        }
      }
    }
    if (actions.length > 0) {
      info.actions = actions;
    }
  }

  if (node.type === 'Text') {
    const text = collectText(node.children);
    if (text !== '') {
      info.text = text;
    }
  }

  return info;
}

function collectText(children: readonly (RenderNode | string)[]): string {
  const parts: string[] = [];
  for (const child of children) {
    if (typeof child === 'string') {
      parts.push(child);
    }
  }
  return parts.join('');
}

function hasA11yInfo(info: A11yInfo): boolean {
  return (
    info.role !== undefined ||
    info.label !== undefined ||
    info.hint !== undefined ||
    info.state !== undefined ||
    info.value !== undefined ||
    info.actions !== undefined ||
    info.text !== undefined ||
    info.testID !== undefined
  );
}
