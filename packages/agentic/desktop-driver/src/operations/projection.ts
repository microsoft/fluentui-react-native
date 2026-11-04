import type { NativeObservation, NativeObservedNode, NativeObserveFact, NativeObserveTruncation, Rect } from '../host/types.js';
import { activationActions, hasInteractiveRole, isContent, isInteractive, isLandmark } from './roles.js';
import { isBareToken, neutralizeText, quoteText, safeToken, utf8Length } from './text.js';
import { indexParents, inDocumentOrder } from './tree.js';

export type ProjectionView = 'all' | 'content' | 'interactive';
export type ProjectionFormat = 'nodes' | 'outline';

/** Every fact an observation can show, in the order providers list them. */
export const observeFacts = [
  'actions',
  'checked',
  'enabled',
  'expanded',
  'focused',
  'geometry',
  'help',
  'required',
  'selected',
  'text',
  'value',
  'visible',
] as const satisfies readonly NativeObserveFact[];

/** State facts that are cheap and say what an element is doing. Content (`value`, `text`, `help`) is opt-in. */
export const defaultObservedFacts: readonly NativeObserveFact[] = ['checked', 'enabled', 'expanded', 'focused', 'selected'];

/** The facts an observation shows: those requested, plus the content the `content` view exists to show. */
export function shownFacts(view: ProjectionView, requested: readonly NativeObserveFact[]): NativeObserveFact[] {
  const shown = new Set(requested);
  if (view === 'content') {
    shown.add('text');
    shown.add('value');
  }
  return observeFacts.filter((fact) => shown.has(fact));
}

/** The facts to read natively: what is shown, plus the actions a filtered view needs to classify elements. */
export function nativeFacts(view: ProjectionView, shown: readonly NativeObserveFact[]): NativeObserveFact[] {
  const facts = new Set(shown);
  if (view !== 'all') {
    facts.add('actions');
  }
  return observeFacts.filter((fact) => facts.has(fact));
}

/**
 * One emitted element. `depth` counts the emitted ancestors, so document order plus depth encodes the tree. Strings
 * have been neutralized (`./text.ts`); `clipped` names the string fields that were cut to the string budget.
 */
export type ProjectedElement = {
  ref: string;
  role: string;
  depth: number;
  name?: string;
  automationId?: string;
  flags?: string[];
  value?: string;
  text?: string;
  help?: string;
  actions?: string[];
  rect?: Rect;
  /** Children exist that this sample did not return, or that the size limits left out. */
  more?: true;
  clipped?: string[];
};

export type ProjectionTruncationReason = NativeObserveTruncation['reason'] | 'maxBytes' | 'maxNodes';

export type ProjectionTruncation = {
  limit?: number;
  /** Matching nodes the size limits left out; set for `maxNodes` and `maxBytes`. */
  omitted?: number;
  reason: ProjectionTruncationReason;
  unvisited?: number;
};

/** How the projection names elements. References are issued only for the nodes that are emitted. */
export type ProjectionRefs = {
  /** Issues or reuses a reference for each node, in order. */
  assign(nodes: readonly NativeObservedNode[]): string[];
  /** The longest reference any of the next `count` issues could be, so sizes can be bounded before refs exist. */
  maxLength(count: number): number;
};

export type ProjectionRequest = {
  budgets: { maxBytes: number; maxNodes: number };
  format: ProjectionFormat;
  observation: NativeObservation;
  offset?: number;
  refs: ProjectionRefs;
  shown: readonly NativeObserveFact[];
  view: ProjectionView;
};

export type Projection = {
  /** True when the native sample was complete and every element the view selects was emitted. */
  complete: boolean;
  counts: {
    /** UTF-8 bytes of the outline, or of the serialized elements plus separators. Never above `maxBytes`. */
    bytes: number;
    emitted: number;
    /** Nodes the view selects, including the context ancestors it keeps. */
    matched: number;
    visited: number;
  };
  nodes?: ProjectedElement[];
  outline?: string;
  /** Candidate offset for a continuation over the same immutable sample. */
  nextOffset?: number;
  /** The reference of the sample's root, when it was emitted. */
  root?: string;
  truncation: ProjectionTruncation[];
};

const toggleRoles: ReadonlySet<string> = new Set(['checkbox', 'menuitem', 'radio', 'switch']);

/**
 * Projects a native sample into the compact form an agent reads.
 *
 * The view chooses which nodes matter: `all` keeps every node, `interactive` keeps operable nodes, and `content` adds
 * the nodes that display something. The root and the named or structural containers above kept nodes stay as context;
 * anonymous wrappers are elided. Each page takes a breadth-first range under the node or byte budget and includes its
 * kept ancestors as context. Output is then written in document order. A node that has children the sample did not
 * return, or that the page left out, carries `more`.
 */
export function project(request: ProjectionRequest): Projection {
  const { budgets, format, observation, refs, view } = request;
  const shown: ReadonlySet<NativeObserveFact> = new Set(request.shown);
  const nodes = observation.nodes;
  const parents = indexParents(nodes);
  const candidate = chooseCandidates(nodes, parents, view);
  const kept = keepAncestry(candidate, parents);
  const order: number[] = [];
  for (const [index, isCandidate] of candidate.entries()) {
    if (isCandidate) {
      order.push(index);
    }
  }

  const nativeMore = nodes.map((node) => node.childrenState === 'truncated' || node.childrenState === 'unknown');
  const base = new Map<number, ElementBase>();
  for (const index of order) {
    base.set(index, describe(nodes[index], shown, view));
  }

  const offset = Math.min(request.offset ?? 0, order.length);
  const pageTargets: number[] = [];
  let pageIndices: number[] = [];
  let pageUnselectedKids = Array.from({ length: nodes.length }, () => 0);
  let stop: 'maxBytes' | 'maxNodes' | undefined;

  const indicesWithAncestors = (targets: readonly number[]) => {
    const included = new Set<number>();
    for (const target of targets) {
      for (let index = target; index >= 0; index = kept.parent[index]) {
        included.add(index);
      }
    }
    return inDocumentOrder([...included], parents);
  };
  const omittedChildren = (included: readonly number[]) => {
    const includedSet = new Set(included);
    const counts = Array.from({ length: nodes.length }, () => 0);
    for (const index of order) {
      if (!includedSet.has(index) && kept.parent[index] >= 0) {
        counts[kept.parent[index]] += 1;
      }
    }
    return counts;
  };
  const measurePage = (indices: readonly number[], unselectedKids: readonly number[]) => {
    const placeholder = 'x'.repeat(refs.maxLength(indices.length));
    return indices.reduce(
      (total, index) =>
        total + measure(format, assemble(base.get(index), kept.depth[index], placeholder, nativeMore[index] || unselectedKids[index] > 0)),
      -1,
    );
  };

  for (let position = offset; position < order.length; position += 1) {
    const targets = [...pageTargets, order[position]];
    const indices = indicesWithAncestors(targets);
    if (indices.length > budgets.maxNodes) {
      stop = 'maxNodes';
      break;
    }
    const unselectedKids = omittedChildren(indices);
    if (measurePage(indices, unselectedKids) > budgets.maxBytes) {
      stop = 'maxBytes';
      break;
    }
    pageTargets.push(order[position]);
    pageIndices = indices;
    pageUnselectedKids = unselectedKids;
  }

  const nextOffset = offset + pageTargets.length;
  const pageIndexSet = new Set(pageIndices);
  const issueOrder = order.filter((index) => pageIndexSet.has(index));
  const issued = refs.assign(issueOrder.map((index) => nodes[index]));
  const refByIndex = new Map<number, string>();
  for (const [position, index] of issueOrder.entries()) {
    refByIndex.set(index, issued[position]);
  }

  const elements = pageIndices.map((index) =>
    assemble(base.get(index), kept.depth[index], refByIndex.get(index), nativeMore[index] || pageUnselectedKids[index] > 0),
  );
  const truncation: ProjectionTruncation[] = observation.truncation.map((entry) => ({ ...entry }));
  if (stop) {
    truncation.push({
      limit: stop === 'maxNodes' ? budgets.maxNodes : budgets.maxBytes,
      omitted: order.length - nextOffset,
      reason: stop,
    });
  }

  const projection: Projection = {
    complete: observation.complete && nextOffset === order.length,
    counts: { bytes: 0, emitted: elements.length, matched: order.length, visited: nodes.length },
    truncation,
  };
  if (pageIndices.includes(0)) {
    projection.root = refByIndex.get(0);
  }
  if (nextOffset < order.length) {
    projection.nextOffset = nextOffset;
  }
  if (format === 'outline') {
    projection.outline = elements.map(outlineLine).join('\n');
    projection.counts.bytes = utf8Length(projection.outline);
  } else {
    projection.nodes = elements;
    projection.counts.bytes = elements.reduce((total, element) => total + utf8Length(JSON.stringify(element)) + 1, -1);
  }
  return projection;
}

/**
 * Chooses the nodes a view keeps. A kept node is the root, a node of interest, or a named or structural container
 * above a node of interest. A container whose children were not returned also counts as of interest, so an agent can
 * see where to look next.
 */
function chooseCandidates(nodes: readonly NativeObservedNode[], parent: readonly number[], view: ProjectionView): boolean[] {
  if (view === 'all') {
    return nodes.map(() => true);
  }
  const anchor = nodes.map((node) => {
    const item = view === 'interactive' ? isInteractive(node) : isInteractive(node) || isContent(node);
    const frontier = (node.childrenState === 'truncated' || node.childrenState === 'unknown') && isLandmark(node);
    return item || frontier;
  });
  // Parents precede their children, so one backward pass reaches every ancestor.
  const hasAnchorBelow = Array.from({ length: nodes.length }, () => false);
  for (let index = nodes.length - 1; index > 0; index -= 1) {
    if ((anchor[index] || hasAnchorBelow[index]) && parent[index] >= 0) {
      hasAnchorBelow[parent[index]] = true;
    }
  }
  return nodes.map((node, index) => index === 0 || anchor[index] || (hasAnchorBelow[index] && isLandmark(node)));
}

/** For every kept node, its nearest kept ancestor and how many kept ancestors it has. */
function keepAncestry(candidate: readonly boolean[], parent: readonly number[]): { depth: number[]; parent: number[] } {
  const nearest = Array.from({ length: candidate.length }, () => -1);
  const keptParent = Array.from({ length: candidate.length }, () => -1);
  const depth = Array.from({ length: candidate.length }, () => 0);
  for (const [index, isCandidate] of candidate.entries()) {
    const inherited = parent[index] >= 0 ? nearest[parent[index]] : -1;
    if (isCandidate) {
      keptParent[index] = inherited;
      depth[index] = inherited >= 0 ? depth[inherited] + 1 : 0;
      nearest[index] = index;
    } else {
      nearest[index] = inherited;
    }
  }
  return { depth, parent: keptParent };
}

type ElementBase = Omit<ProjectedElement, 'depth' | 'more' | 'ref'>;

function hasText(value: string | undefined): boolean {
  return value !== undefined && value.trim().length > 0;
}

function describe(node: NativeObservedNode, shown: ReadonlySet<NativeObserveFact>, view: ProjectionView): ElementBase {
  const element: ElementBase = { role: safeToken(node.role) };
  const cut = new Set(node.clipped ?? []);
  const clipped: string[] = [];
  if (hasText(node.name)) {
    element.name = neutralizeText(node.name);
    if (cut.has('name')) {
      clipped.push('name');
    }
  }
  if (hasText(node.automationId)) {
    element.automationId = neutralizeText(node.automationId);
    if (cut.has('automationId')) {
      clipped.push('automationId');
    }
  }
  const flags = describeFlags(node, shown);
  if (flags.length > 0) {
    element.flags = flags;
  }
  // A toggle's value only repeats the checked state it already shows.
  const repeatsChecked = shown.has('checked') && toggleRoles.has(node.role) && node.checked?.supported === true;
  if (shown.has('value') && hasText(node.value) && !repeatsChecked) {
    element.value = neutralizeText(node.value);
    if (cut.has('value')) {
      clipped.push('value');
    }
  }
  if (shown.has('text') && hasText(node.text) && node.text !== node.name && node.text !== node.value) {
    element.text = neutralizeText(node.text);
    if (cut.has('text')) {
      clipped.push('text');
    }
  }
  if (shown.has('help') && node.helpText?.supported === true && hasText(node.helpText.value)) {
    element.help = neutralizeText(node.helpText.value);
    if (cut.has('helpText')) {
      clipped.push('help');
    }
  }
  // Operable only through a published action: show it, so the line says why the node is listed.
  const actions = shown.has('actions')
    ? node.actions
    : view !== 'all' && !hasInteractiveRole(node.role)
      ? activationActions(node.actions ?? [])
      : [];
  if (actions && actions.length > 0) {
    element.actions = actions.map((action) => safeToken(action));
  }
  if (shown.has('geometry') && node.rect) {
    element.rect = {
      height: Math.round(node.rect.height),
      width: Math.round(node.rect.width),
      x: Math.round(node.rect.x),
      y: Math.round(node.rect.y),
    };
  }
  if (clipped.length > 0) {
    element.clipped = clipped;
  }
  return element;
}

/** Positive-only state flags: a node that has none of them is unremarkable, so absence costs nothing. */
function describeFlags(node: NativeObservedNode, shown: ReadonlySet<NativeObserveFact>): string[] {
  const flags: string[] = [];
  if (shown.has('enabled') && node.enabled) {
    if (!node.enabled.supported) {
      flags.push('?enabled');
    } else if (!node.enabled.value) {
      flags.push('disabled');
    }
  }
  if (shown.has('focused') && node.focused?.supported && node.focused.value) {
    flags.push('focused');
  }
  if (shown.has('selected') && node.selected?.supported && node.selected.value) {
    flags.push('selected');
  }
  if (shown.has('checked') && node.checked) {
    if (!node.checked.supported) {
      if (toggleRoles.has(node.role)) {
        flags.push('?checked');
      }
    } else if (node.checked.value === 'mixed') {
      flags.push('mixed');
    } else if (node.checked.value) {
      flags.push('checked');
    } else if (toggleRoles.has(node.role)) {
      flags.push('unchecked');
    }
  }
  if (shown.has('expanded') && node.expanded?.supported) {
    flags.push(node.expanded.value ? 'expanded' : 'collapsed');
  }
  if (shown.has('required') && node.required?.supported && node.required.value) {
    flags.push('required');
  }
  if (shown.has('visible') && node.visible?.supported && !node.visible.value) {
    flags.push('hidden');
  }
  return flags;
}

function assemble(base: ElementBase, depth: number, ref: string, more: boolean): ProjectedElement {
  const element: ProjectedElement = { ref, role: base.role, depth };
  if (base.name !== undefined) {
    element.name = base.name;
  }
  if (base.automationId !== undefined) {
    element.automationId = base.automationId;
  }
  if (base.flags) {
    element.flags = base.flags;
  }
  if (base.value !== undefined) {
    element.value = base.value;
  }
  if (base.text !== undefined) {
    element.text = base.text;
  }
  if (base.help !== undefined) {
    element.help = base.help;
  }
  if (base.actions) {
    element.actions = base.actions;
  }
  if (base.rect) {
    element.rect = base.rect;
  }
  if (more) {
    element.more = true;
  }
  if (base.clipped) {
    element.clipped = base.clipped;
  }
  return element;
}

/** Bytes an element adds, including its separator. */
function measure(format: ProjectionFormat, element: ProjectedElement): number {
  return utf8Length(format === 'outline' ? outlineLine(element) : JSON.stringify(element)) + 1;
}

/**
 * One outline line: `<depth spaces><role> "<name>" <ref> #<id> <flags> value="…" text="…" help="…" actions=A,B @x,y wxh more`.
 * Quoted strings are JSON string literals; a string that ends in `…` before its closing quote was cut to the string
 * budget. Everything after the ref is optional and appears in this order.
 */
function outlineLine(element: ProjectedElement): string {
  const cut = new Set(element.clipped);
  let line = `${' '.repeat(element.depth)}${element.role}`;
  if (element.name !== undefined) {
    line += ` ${quoteText(element.name, cut.has('name'))}`;
  }
  line += ` ${element.ref}`;
  if (element.automationId !== undefined) {
    line += ` #${!cut.has('automationId') && isBareToken(element.automationId) ? element.automationId : quoteText(element.automationId, cut.has('automationId'))}`;
  }
  for (const flag of element.flags ?? []) {
    line += ` ${flag}`;
  }
  if (element.value !== undefined) {
    line += ` value=${quoteText(element.value, cut.has('value'))}`;
  }
  if (element.text !== undefined) {
    line += ` text=${quoteText(element.text, cut.has('text'))}`;
  }
  if (element.help !== undefined) {
    line += ` help=${quoteText(element.help, cut.has('help'))}`;
  }
  if (element.actions) {
    line += ` actions=${element.actions.join(',')}`;
  }
  if (element.rect) {
    line += ` @${element.rect.x},${element.rect.y} ${element.rect.width}x${element.rect.height}`;
  }
  if (element.more) {
    line += ' more';
  }
  return line;
}
