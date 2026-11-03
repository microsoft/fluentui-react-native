import { z } from 'zod';

import type { NativeObservation, NativeObservedNode, NativeObserveBudget, NativeObserveFact, NativeObserveRequest } from '../host/types.js';

/**
 * The FDR1 bounded-observation contract (`native/PROTOCOL.md`). Node validates every request it sends and every sample
 * a helper returns, so a provider that drifts from the contract fails closed instead of corrupting agent state.
 */

const factOrder: Record<NativeObserveFact, number> = {
  actions: 0,
  checked: 1,
  enabled: 2,
  expanded: 3,
  focused: 4,
  geometry: 5,
  help: 6,
  required: 7,
  selected: 8,
  text: 9,
  value: 10,
  visible: 11,
};

export const observeFacts = Object.keys(factOrder) as [NativeObserveFact, ...NativeObserveFact[]];

/** The ranges a helper accepts; anything outside is `invalid-params` and is never clamped by the helper. */
export const observeBudgetLimits = {
  deadlineMs: { max: 30_000, min: 50 },
  maxBytes: { max: 4_194_304, min: 4_096 },
  maxDepth: { max: 64, min: 0 },
  maxStringLength: { max: 1_024, min: 16 },
  maxVisited: { max: 5_000, min: 1 },
} as const satisfies Record<keyof NativeObserveBudget, { max: number; min: number }>;

export const maximumReleasedIds = 1_000;
export const maximumElementIdBytes = 256;

const identifier = z.string().min(1).refine(fitsIdentifier, `must be 1 to ${maximumElementIdBytes} UTF-8 bytes`);

function fitsIdentifier(value: string): boolean {
  return Buffer.byteLength(value, 'utf8') <= maximumElementIdBytes;
}

function budgetField(limit: { max: number; min: number }) {
  return z.number().int().min(limit.min).max(limit.max);
}

export const nativeObserveRequestSchema = z.strictObject({
  budget: z.strictObject({
    deadlineMs: budgetField(observeBudgetLimits.deadlineMs),
    maxBytes: budgetField(observeBudgetLimits.maxBytes),
    maxDepth: budgetField(observeBudgetLimits.maxDepth),
    maxStringLength: budgetField(observeBudgetLimits.maxStringLength),
    maxVisited: budgetField(observeBudgetLimits.maxVisited),
  }),
  facts: z
    .array(z.enum(observeFacts))
    .max(observeFacts.length)
    .refine((facts) => new Set(facts).size === facts.length, 'facts must not repeat'),
  rootId: identifier.optional(),
  windowId: z.string().min(1),
});

export const nativeReleaseElementsSchema = z.strictObject({
  ids: z
    .array(identifier)
    .max(maximumReleasedIds)
    .refine((ids) => new Set(ids).size === ids.length, 'ids must not repeat'),
});

function supported<T extends z.ZodType>(value: T) {
  return z.union([z.object({ supported: z.literal(true), value }), z.object({ reason: z.string(), supported: z.literal(false) })]);
}

const nodeSchema = z.object({
  actions: z.array(z.string()).optional(),
  automationId: z.string().optional(),
  checked: supported(z.union([z.boolean(), z.literal('mixed')])).optional(),
  childCount: z.number().int().nonnegative().optional(),
  childrenState: z.enum(['complete', 'none', 'truncated', 'unknown']),
  clipped: z.array(z.string()).optional(),
  depth: z.number().int().nonnegative(),
  enabled: supported(z.boolean()).optional(),
  expanded: supported(z.boolean()).optional(),
  focused: supported(z.boolean()).optional(),
  helpText: supported(z.string()).optional(),
  id: identifier,
  name: z.string().optional(),
  parentId: identifier.optional(),
  rect: z.object({ height: z.number(), width: z.number(), x: z.number(), y: z.number() }).optional(),
  required: supported(z.boolean()).optional(),
  role: z.string().min(1),
  scope: z.enum(['application', 'chrome', 'preview', 'secondary-window']),
  selected: supported(z.boolean()).optional(),
  text: z.string().optional(),
  value: z.string().optional(),
  visible: supported(z.boolean()).optional(),
});

export const nativeObservationSchema = z.object({
  complete: z.boolean(),
  elapsedMs: z.number().nonnegative(),
  nodes: z.array(nodeSchema).max(observeBudgetLimits.maxVisited.max),
  truncation: z
    .array(
      z.object({
        limit: z.number().nonnegative().optional(),
        reason: z.enum(['bytes', 'deadline', 'depth', 'references', 'unreadable', 'visited']),
        unvisited: z.number().int().nonnegative().optional(),
      }),
    )
    .max(6),
  unsupportedFacts: z.array(z.enum(observeFacts)).max(observeFacts.length),
});

/** Returns the first way a request breaks the contract, or `undefined` when a helper would accept it. */
export function describeObserveRequestViolation(request: unknown): string | undefined {
  const parsed = nativeObserveRequestSchema.safeParse(request);
  return parsed.success ? undefined : formatIssue(parsed.error);
}

/** Returns the first way an id list breaks the `releaseElements` contract, or `undefined` when it is acceptable. */
export function describeReleaseViolation(ids: unknown): string | undefined {
  const parsed = nativeReleaseElementsSchema.safeParse({ ids });
  return parsed.success ? undefined : formatIssue(parsed.error);
}

const factFields: Record<NativeObserveFact, readonly (keyof NativeObservedNode)[]> = {
  actions: ['actions'],
  checked: ['checked'],
  enabled: ['enabled'],
  expanded: ['expanded'],
  focused: ['focused'],
  geometry: ['rect'],
  help: ['helpText'],
  required: ['required'],
  selected: ['selected'],
  text: ['text'],
  value: ['value'],
  visible: ['visible'],
};

const clippableFields = ['automationId', 'helpText', 'name', 'text', 'value'] as const;

type ParsedObservation = z.infer<typeof nativeObservationSchema>;

// The repository tsconfig disables strictNullChecks, which Zod's inferred types assume, so the parsed value is
// asserted to the host type the schema mirrors; the conformance tests keep the two in step.
function acceptObservation(parsed: ParsedObservation): NativeObservation {
  return parsed as unknown as NativeObservation;
}

export type ObservationParse = { observation: NativeObservation; status: 'accepted' } | { message: string; status: 'rejected' };

/**
 * Parses a helper's response and checks it against the request that produced it. Fields the contract does not name
 * are dropped, so a provider cannot pass unrequested data through to an agent.
 */
export function parseNativeObservation(request: NativeObserveRequest, value: unknown): ObservationParse {
  const parsed = nativeObservationSchema.safeParse(value);
  if (!parsed.success) {
    return { message: formatIssue(parsed.error), status: 'rejected' };
  }
  const observation = acceptObservation(parsed.data);
  const violation = describeObservationViolation(request, observation);
  return violation ? { message: violation, status: 'rejected' } : { observation, status: 'accepted' };
}

/** Checks a well-formed sample against its request: shape, order, budgets, requested facts, and honest completeness. */
export function describeObservationViolation(request: NativeObserveRequest, observation: NativeObservation): string | undefined {
  const { budget } = request;
  const requested = new Set(request.facts);
  const { nodes } = observation;
  if (nodes.length > budget.maxVisited) {
    return `The sample has ${nodes.length} nodes; the budget allows ${budget.maxVisited}.`;
  }
  if (observation.complete !== (observation.truncation.length === 0)) {
    return 'complete must be true exactly when the sample reports no truncation.';
  }
  const reasons = new Set(observation.truncation.map((entry) => entry.reason));
  if (reasons.size !== observation.truncation.length) {
    return 'A truncation reason appears more than once.';
  }
  if (nodes.length === 0 && !reasons.has('references')) {
    return 'A sample is empty only when the element table has no room for the root, which it reports as "references".';
  }
  for (const fact of observation.unsupportedFacts) {
    if (!requested.has(fact)) {
      return `unsupportedFacts lists "${fact}", which was not requested.`;
    }
  }

  const unsupported = new Set(observation.unsupportedFacts);
  const byId = new Map<string, NativeObservedNode>();
  const emittedChildren = new Map<string, number>();
  let previousDepth = 0;
  for (const [index, node] of nodes.entries()) {
    const label = `Node "${node.id}"`;
    if (byId.has(node.id)) {
      return `${label} repeats.`;
    }
    if (index === 0) {
      if (node.depth !== 0 || node.parentId !== undefined) {
        return `${label} must be the root: depth 0 and no parentId.`;
      }
    } else {
      const parent = node.parentId === undefined ? undefined : byId.get(node.parentId);
      if (!parent) {
        return `${label} must name an earlier node as its parent.`;
      }
      if (node.depth !== parent.depth + 1) {
        return `${label} is at depth ${node.depth} under a parent at depth ${parent.depth}.`;
      }
      if (node.depth < previousDepth) {
        return `${label} breaks breadth-first order.`;
      }
      emittedChildren.set(parent.id, (emittedChildren.get(parent.id) ?? 0) + 1);
    }
    if (node.depth > budget.maxDepth) {
      return `${label} is deeper than the budget allows.`;
    }
    previousDepth = node.depth;
    byId.set(node.id, node);

    const unrequested = findUnrequestedFact(node, requested, unsupported);
    if (unrequested) {
      return `${label} carries "${unrequested}", which was not requested or was reported unsupported.`;
    }
    const overlong = findOverlongString(node, budget.maxStringLength);
    if (overlong) {
      return `${label} has a "${overlong}" longer than ${budget.maxStringLength} characters.`;
    }
    for (const field of node.clipped ?? []) {
      if (!(clippableFields as readonly string[]).includes(field)) {
        return `${label} lists "${field}" as clipped, which is not a string field.`;
      }
      if (endsInHighSurrogate(clippedText(node, field))) {
        return `${label} cuts "${field}" between the halves of a surrogate pair.`;
      }
    }
  }

  for (const node of nodes) {
    const emitted = emittedChildren.get(node.id) ?? 0;
    const problem = describeChildrenViolation(node, emitted);
    if (problem) {
      return `Node "${node.id}" ${problem}`;
    }
    if (observation.complete && (node.childrenState === 'truncated' || node.childrenState === 'unknown')) {
      return `Node "${node.id}" has ${node.childrenState} children in a sample reported complete.`;
    }
  }
  return undefined;
}

function describeChildrenViolation(node: NativeObservedNode, emitted: number): string | undefined {
  switch (node.childrenState) {
    case 'none':
      return emitted === 0 && (node.childCount ?? 0) === 0 ? undefined : 'reports no children but has some.';
    case 'complete':
      return emitted > 0 && (node.childCount === undefined || node.childCount === emitted)
        ? undefined
        : 'reports complete children that do not match what was emitted.';
    case 'truncated':
      return node.childCount === undefined || node.childCount > emitted ? undefined : 'reports truncated children that were all emitted.';
    case 'unknown':
      return emitted === 0 && node.childCount === undefined ? undefined : 'reports unread children but has emitted children or a count.';
  }
}

function findUnrequestedFact(
  node: NativeObservedNode,
  requested: ReadonlySet<NativeObserveFact>,
  unsupported: ReadonlySet<NativeObserveFact>,
) {
  for (const fact of observeFacts) {
    if (requested.has(fact) && !unsupported.has(fact)) {
      continue;
    }
    for (const field of factFields[fact]) {
      if (node[field] !== undefined) {
        return fact;
      }
    }
  }
  return undefined;
}

function findOverlongString(node: NativeObservedNode, limit: number): string | undefined {
  for (const field of ['automationId', 'name', 'text', 'value'] as const) {
    if ((node[field]?.length ?? 0) > limit) {
      return field;
    }
  }
  if (node.helpText?.supported && node.helpText.value.length > limit) {
    return 'helpText';
  }
  return node.actions?.some((action) => action.length > limit) ? 'actions' : undefined;
}

function clippedText(node: NativeObservedNode, field: string): string | undefined {
  if (field === 'helpText') {
    return node.helpText?.supported ? node.helpText.value : undefined;
  }
  return node[field as 'automationId' | 'name' | 'text' | 'value'];
}

function endsInHighSurrogate(value: string | undefined): boolean {
  const code = value ? value.charCodeAt(value.length - 1) : 0;
  return code >= 0xd800 && code <= 0xdbff;
}

function formatIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return 'The value does not match the contract.';
  }
  const path = issue.path.map(String).join('.');
  return path ? `${path}: ${issue.message}` : issue.message;
}
