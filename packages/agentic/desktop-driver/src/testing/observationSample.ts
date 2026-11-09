import type { NativeChildrenState, NativeObservation, NativeObservedNode } from '../host/types.js';

/** A node and its children, written the way a test reads it. `id` defaults to the node's breadth-first position. */
export type SampleSpec = Partial<
  Omit<NativeObservedNode, 'childCount' | 'childrenState' | 'depth' | 'id' | 'parentId' | 'role' | 'scope'>
> & {
  children?: SampleSpec[];
  childCount?: number;
  childrenState?: NativeChildrenState;
  id?: string;
  role: string;
  scope?: NativeObservedNode['scope'];
};

/**
 * Flattens a nested spec into the breadth-first sample a provider returns: root first, parents before children,
 * sibling order preserved. A node with children is `complete` and one without is `none`, unless the spec says
 * otherwise, as a depth-limited provider would for `unknown`.
 */
export function buildSample(root: SampleSpec, overrides: Partial<Omit<NativeObservation, 'nodes'>> = {}): NativeObservation {
  const nodes: NativeObservedNode[] = [];
  const queue: { depth: number; parentId?: string; spec: SampleSpec }[] = [{ depth: 0, spec: root }];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const { depth, parentId, spec } = queue[cursor];
    const { children, childCount, childrenState, id, scope, ...fields } = spec;
    const nodeId = id ?? `n${cursor}`;
    const state = childrenState ?? (children && children.length > 0 ? 'complete' : 'none');
    const node: NativeObservedNode = { ...fields, childrenState: state, depth, id: nodeId, role: spec.role, scope: scope ?? 'application' };
    if (parentId !== undefined) {
      node.parentId = parentId;
    }
    const count = childCount ?? (state === 'complete' ? children?.length : undefined);
    if (count !== undefined) {
      node.childCount = count;
    }
    nodes.push(node);
    for (const child of children ?? []) {
      queue.push({ depth: depth + 1, parentId: nodeId, spec: child });
    }
  }
  const truncation = overrides.truncation ?? [];
  return { complete: truncation.length === 0, elapsedMs: 1, truncation, unsupportedFacts: [], ...overrides, nodes };
}

/** `{ supported: true, value }`, the way providers report a fact they can read. */
export function supportedFact<T>(value: T): { supported: true; value: T } {
  return { supported: true, value };
}

/** A fact the provider cannot read for one node. */
export function unsupportedFact(reason = 'not applicable'): { reason: string; supported: false } {
  return { reason, supported: false };
}
