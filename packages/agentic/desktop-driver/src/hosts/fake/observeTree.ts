import type {
  NativeChildrenState,
  NativeElementSnapshot,
  NativeObservation,
  NativeObservedNode,
  NativeObserveFact,
  NativeObserveRequest,
  NativeObserveTruncation,
  NativeObserveTruncationReason,
} from '../../host/types.js';

/** What the fake knows about an element beyond its snapshot. */
export type TreeSampleExtras = {
  actions?: readonly string[];
  /** A password or secure field: `value` and `text` are never reported. */
  secure?: boolean;
};

export type TreeSampleSource = {
  /** Children in provider order. */
  childrenOf(elementId: string): readonly NativeElementSnapshot[];
  extras(elementId: string): TreeSampleExtras;
  /** The id the host issues for an element, or `undefined` when its element table is at capacity. */
  recordFor(elementId: string): string | undefined;
};

export type TreeSampleOptions = {
  /** Fact the fake platform cannot report for any element. */
  unsupportedFacts: ReadonlySet<NativeObserveFact>;
  /** Called before each element is read; a slow provider awaits here, and an abort rejects. */
  beforeRead(): Promise<void>;
  /** Elements whose children cannot be read. */
  unreadableChildrenOf: ReadonlySet<string>;
};

type QueueEntry = { depth: number; element: NativeElementSnapshot; parentId?: string };

/**
 * A reference implementation of the FDR1 `observe` walk over the fake's element graph. It follows the contract in
 * `native/PROTOCOL.md` closely enough that Node's validator accepts it, which keeps the fake honest as the model of a
 * conforming provider.
 */
export async function sampleTree(
  root: NativeElementSnapshot,
  request: NativeObserveRequest,
  source: TreeSampleSource,
  options: TreeSampleOptions,
): Promise<NativeObservation> {
  const { budget } = request;
  const requested = new Set(request.facts);
  const started = Date.now();
  const nodes: NativeObservedNode[] = [];
  const truncation = new Map<NativeObserveTruncationReason, NativeObserveTruncation>();
  const pendingChildren = new Map<string, number>();
  const queue: QueueEntry[] = [{ depth: 0, element: root }];
  let bytes = 0;
  let depthUnvisited = 0;

  const stop = (reason: NativeObserveTruncationReason, limit?: number, unvisited?: number) => {
    truncation.set(reason, {
      ...(limit === undefined ? {} : { limit }),
      ...(unvisited === undefined ? {} : { unvisited }),
      reason,
    });
  };

  let head = 0;
  while (head < queue.length) {
    const entry = queue[head];
    // The root is always read; the budgets bound everything after it.
    if (nodes.length > 0 && nodes.length >= budget.maxVisited) {
      stop('visited', budget.maxVisited, queue.length - head);
      break;
    }
    if (nodes.length > 0 && Date.now() - started >= budget.deadlineMs) {
      stop('deadline', budget.deadlineMs, queue.length - head);
      break;
    }
    await options.beforeRead();

    const node = readNode(entry, requested, budget.maxStringLength, source, options);
    const children = describeChildren(entry, budget.maxDepth, source, options);
    node.childrenState = children.state ?? 'truncated';
    if (children.count !== undefined) {
      node.childCount = children.count;
    }
    // The size of the finished node, assuming the longest children state it can settle into.
    const size = Buffer.byteLength(JSON.stringify(node));
    if (nodes.length > 0 && bytes + size > budget.maxBytes) {
      stop('bytes', budget.maxBytes, queue.length - head);
      break;
    }
    const recordId = source.recordFor(entry.element.id);
    if (recordId === undefined) {
      stop('references', undefined, queue.length - head);
      break;
    }
    node.id = recordId;
    bytes += size;
    nodes.push(node);
    head += 1;

    if (children.unreadable) {
      stop('unreadable');
    }
    if (children.cut) {
      depthUnvisited += children.count ?? 0;
    }
    for (const child of children.enqueue) {
      queue.push({ depth: entry.depth + 1, element: child, parentId: recordId });
    }
    if (children.enqueue.length > 0) {
      pendingChildren.set(recordId, children.enqueue.length);
    }
  }

  if (depthUnvisited > 0) {
    stop('depth', budget.maxDepth, depthUnvisited);
  }
  settleChildStates(nodes, pendingChildren);
  return {
    complete: truncation.size === 0,
    elapsedMs: Date.now() - started,
    nodes,
    truncation: [...truncation.values()],
    unsupportedFacts: request.facts.filter((fact) => options.unsupportedFacts.has(fact)),
  };
}

type ChildRead = { count?: number; cut?: boolean; enqueue: NativeElementSnapshot[]; state?: NativeChildrenState; unreadable?: boolean };

function describeChildren(entry: QueueEntry, maxDepth: number, source: TreeSampleSource, options: TreeSampleOptions): ChildRead {
  if (options.unreadableChildrenOf.has(entry.element.id)) {
    return { enqueue: [], state: 'unknown', unreadable: true };
  }
  const children = source.childrenOf(entry.element.id);
  if (children.length === 0) {
    return { count: 0, enqueue: [], state: 'none' };
  }
  if (entry.depth >= maxDepth) {
    return { count: children.length, cut: true, enqueue: [], state: 'truncated' };
  }
  return { count: children.length, enqueue: [...children] };
}

/** A node whose children were queued is complete only when every one of them was emitted. */
function settleChildStates(nodes: NativeObservedNode[], pendingChildren: ReadonlyMap<string, number>): void {
  const emitted = new Map<string, number>();
  for (const node of nodes) {
    if (node.parentId !== undefined) {
      emitted.set(node.parentId, (emitted.get(node.parentId) ?? 0) + 1);
    }
  }
  for (const node of nodes) {
    const queued = pendingChildren.get(node.id);
    if (queued !== undefined) {
      node.childrenState = (emitted.get(node.id) ?? 0) === queued ? 'complete' : 'truncated';
    }
  }
}

/** Cuts at a UTF-16 code-unit limit without separating a surrogate pair, which no provider could encode. */
function clipToLimit(value: string, limit: number): string {
  const lastKept = value.charCodeAt(limit - 1);
  return value.slice(0, lastKept >= 0xd800 && lastKept <= 0xdbff ? limit - 1 : limit);
}

function readNode(
  entry: QueueEntry,
  requested: ReadonlySet<NativeObserveFact>,
  maxStringLength: number,
  source: TreeSampleSource,
  options: TreeSampleOptions,
): NativeObservedNode {
  const { element } = entry;
  const clipped: string[] = [];
  const clip = (field: string, value: string | undefined): string | undefined => {
    if (value === undefined || value.length <= maxStringLength) {
      return value;
    }
    clipped.push(field);
    return clipToLimit(value, maxStringLength);
  };
  const extras = source.extras(element.id);
  const node: NativeObservedNode = {
    childrenState: 'unknown',
    depth: entry.depth,
    id: element.id,
    role: element.role,
    scope: element.scope,
  };
  if (entry.parentId !== undefined) {
    node.parentId = entry.parentId;
  }
  const name = clip('name', element.name);
  if (name !== undefined) {
    node.name = name;
  }
  const automationId = clip('automationId', element.automationId);
  if (automationId !== undefined) {
    node.automationId = automationId;
  }

  const reported = (fact: NativeObserveFact) => requested.has(fact) && !options.unsupportedFacts.has(fact);
  if (reported('checked')) {
    node.checked = element.checked;
  }
  if (reported('enabled')) {
    node.enabled = element.enabled;
  }
  if (reported('expanded')) {
    node.expanded = element.expanded;
  }
  if (reported('focused')) {
    node.focused = element.focused;
  }
  if (reported('selected')) {
    node.selected = element.selected;
  }
  if (reported('visible')) {
    node.visible = element.visible;
  }
  if (reported('required')) {
    node.required = element.required ?? { supported: false, reason: 'The element does not report whether it is required.' };
  }
  if (reported('help')) {
    node.helpText = element.helpText ?? { supported: false, reason: 'The element has no help text.' };
  }
  if (reported('geometry')) {
    node.rect = { ...element.rect };
  }
  if (reported('actions')) {
    node.actions = (extras.actions ?? []).map((action) => action.slice(0, maxStringLength));
  }
  if (reported('value') && !extras.secure) {
    const value = clip('value', element.value);
    if (value !== undefined) {
      node.value = value;
    }
  }
  if (reported('text') && !extras.secure) {
    const text = clip('text', element.text);
    if (text !== undefined) {
      node.text = text;
    }
  }
  if (clipped.length > 0) {
    node.clipped = clipped;
  }
  return node;
}
